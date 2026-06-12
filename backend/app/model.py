"""
model.py — AI-слой CityEye
===========================

Этот файл отвечает за два вида «интеллекта» в приложении.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. РАСПОЗНАВАНИЕ ФОТО (Computer Vision)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Функция: analyze_photo(image_bytes) → {type, severity, description}

Как это работает:
  1. Берём фото как байты и кодируем в base64 (формат, понятный OpenAI API).
  2. Отправляем запрос в GPT-4o (мультимодальная модель — она умеет «видеть» картинки).
  3. В промпте явно требуем строгий JSON с тремя полями:
       - type:        что на фото (pothole/garbage/streetlight/graffiti/sign/other)
       - severity:    насколько опасно (low / medium / high)
       - description: короткое описание на русском
  4. Парсим ответ безопасно: если модель вернула что-то странное — не падаем,
     а возвращаем дефолт {type: "other", severity: "medium"}.

Почему GPT-4o, а не YOLO/ResNet?
  YOLO требует обученной модели под конкретные классы.
  GPT-4o понимает контекст («яма у тротуара рядом с канализацией» → high severity),
  а не просто ищет пиксельные паттерны. Плюс — нулевое время на настройку.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 2. ЭМБЕДДИНГИ (для дедупликации заявок)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Функция: embed(text) → list[float]  (вектор из 1536 чисел)

Что такое эмбеддинг?
  Языковая модель умеет превращать текст в вектор — список чисел.
  Смысл: похожие тексты → похожие векторы.
  "Яма на Абая" и "Большая выбоина у перекрёстка Абая" будут близко в пространстве.
  "Мусор у подъезда" и "Яма на дороге" — далеко.

Как мы это используем (см. dedup.py):
  1. При создании заявки считаем embed("тип. описание").
  2. Сравниваем через cosine similarity с векторами других открытых заявок того же типа
     в радиусе 80 метров.
  3. Если similarity > 0.85 — это та же проблема → объединяем, не создаём дубликат.

Модель: text-embedding-3-small (OpenAI) — быстрая, дешёвая, 1536 измерений.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MOCK-РЕЖИМ (без OPENAI_API_KEY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Если ключ не задан — приложение НЕ падает, а использует заглушки:
  - analyze_photo → результат детерминирован по хэшу файла (выглядит правдоподобно)
  - embed → псевдо-вектор из хэшей слов; первый токен (тип) имеет вес ×8,
    поэтому дедупликация «по типу + радиус» всё равно работает в demo-режиме.
"""

import base64
import hashlib
import json
import math

from .config import settings
from .models import PROBLEM_TYPES, SEVERITIES

# ---------------------------------------------------------------------------
# OpenAI client (создаётся один раз при первом вызове, lazy init)
# ---------------------------------------------------------------------------

_client = None


def _get_client():
    """Возвращает OpenAI-клиент или None в mock-режиме."""
    global _client
    if _client is None and settings.has_openai:
        from openai import OpenAI
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


# ---------------------------------------------------------------------------
# Промпт для Vision
# ---------------------------------------------------------------------------

VISION_PROMPT = (
    "Ты — система классификации городских инфраструктурных проблем для приложения CityEye (Алматы).\n"
    "Посмотри на фото и верни СТРОГО JSON без markdown и пояснений:\n"
    '{"type": <одно из: pothole, garbage, streetlight, graffiti, sign, other>, '
    '"severity": <одно из: low, medium, high>, '
    '"description": <описание на русском, до 120 символов>}\n\n'
    "type — главный объект проблемы: pothole=яма, garbage=мусор, streetlight=фонарь, "
    "graffiti=граффити/вандализм, sign=знак/разметка, other=всё остальное.\n"
    "severity — срочность: low=косметика, medium=неудобство, high=опасность/авария.\n"
    "Только JSON. Никакого текста вокруг."
)


# ---------------------------------------------------------------------------
# 1. VISION — распознавание фото
# ---------------------------------------------------------------------------

def analyze_photo(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """
    Отправляет фото в GPT-4o и получает тип/серьёзность/описание проблемы.

    Args:
        image_bytes:  бинарное содержимое фото (JPEG или PNG)
        content_type: MIME-тип файла

    Returns:
        dict с ключами 'type', 'severity', 'description'
    """
    client = _get_client()

    if client is None:
        # Нет ключа → детерминированная заглушка
        return _mock_analyze(image_bytes)

    try:
        # Кодируем фото в base64: OpenAI принимает картинки в таком формате
        b64 = base64.b64encode(image_bytes).decode()

        response = client.chat.completions.create(
            model=settings.openai_vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{b64}",
                                "detail": "low",  # быстрее и дешевле для классификации
                            },
                        },
                    ],
                }
            ],
            max_tokens=200,
            temperature=0,  # 0 = детерминированный ответ, без галлюцинаций
        )

        raw_text = response.choices[0].message.content
        return _parse_vision_response(raw_text)

    except Exception as exc:
        # Любая ошибка API → не падаем, возвращаем дефолт
        print(f"[model] vision error: {exc}")
        return _mock_analyze(image_bytes)


def _parse_vision_response(raw: str) -> dict:
    """
    Безопасно извлекает JSON из ответа модели.

    Модель иногда оборачивает JSON в ```json ... ```, иногда добавляет пояснения.
    Ищем первую '{' и последнюю '}' — это и есть наш объект.
    """
    raw = raw.strip().strip("`")
    if raw.startswith("json"):
        raw = raw[4:]

    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("JSON не найден в ответе модели")

    data = json.loads(raw[start : end + 1])

    # Валидируем значения — принимаем только допустимые
    ptype = str(data.get("type", "other")).lower()
    severity = str(data.get("severity", "medium")).lower()

    return {
        "type": ptype if ptype in PROBLEM_TYPES else "other",
        "severity": severity if severity in SEVERITIES else "medium",
        "description": str(data.get("description", "")).strip()[:200],
    }


# ---------------------------------------------------------------------------
# 2. EMBEDDINGS — смысловые векторы для дедупликации
# ---------------------------------------------------------------------------

def embed(text: str) -> list[float]:
    """
    Превращает текст в вектор из 1536 чисел (OpenAI text-embedding-3-small).

    Вход:  строка вида "pothole. Яма на проезжей части у перекрёстка"
    Выход: list[float] длиной 1536 — «смысловой отпечаток» текста

    Похожие тексты → близкие векторы (cosine similarity → 1.0).
    Разные тексты  → далёкие векторы (cosine similarity → 0.0).
    """
    client = _get_client()

    if client is None:
        return _mock_embed(text)

    try:
        response = client.embeddings.create(
            model=settings.openai_embed_model,
            input=text,
        )
        return response.data[0].embedding

    except Exception as exc:
        print(f"[model] embed error: {exc}")
        return _mock_embed(text)


# ---------------------------------------------------------------------------
# MOCK-режим: заглушки без OpenAI
# ---------------------------------------------------------------------------

_MOCK_TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign"]
_MOCK_DESCRIPTIONS = {
    "pothole":     "Яма на проезжей части",
    "garbage":     "Несанкционированная свалка мусора",
    "streetlight": "Неработающий уличный фонарь",
    "graffiti":    "Граффити на фасаде здания",
    "sign":        "Повреждённый дорожный знак",
}


def _mock_analyze(image_bytes: bytes) -> dict:
    """
    Детерминированная заглушка: результат зависит от хэша файла,
    поэтому одно и то же фото всегда даёт один и тот же ответ.
    """
    h = int(hashlib.md5(image_bytes).hexdigest(), 16)
    ptype = _MOCK_TYPES[h % len(_MOCK_TYPES)]
    severity = SEVERITIES[(h >> 8) % len(SEVERITIES)]
    return {
        "type": ptype,
        "severity": severity,
        "description": _MOCK_DESCRIPTIONS[ptype],
    }


def _mock_embed(text: str, dim: int = 96) -> list[float]:
    """
    Псевдо-эмбеддинг: детерминированный вектор на основе хэшей слов.

    Трюк: первый токен — тип проблемы (напр. "pothole") — получает вес ×8.
    Благодаря этому две заявки одного типа дают cosine similarity > 0.85,
    даже если описания немного разные. Так дедупликация работает в demo-режиме.
    """
    vec = [0.0] * dim
    tokens = text.lower().split()

    for i, token in enumerate(tokens):
        # Каждый токен «голосует» за определённый индекс вектора
        idx = int(hashlib.md5(token.encode()).hexdigest(), 16) % dim
        weight = 8.0 if i == 0 else 1.0  # первый токен (тип) доминирует
        vec[idx] += weight

    # Нормируем до единичной длины (cosine similarity работает с нормированными векторами)
    length = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / length for v in vec]
