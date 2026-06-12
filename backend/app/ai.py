"""AI-слой: распознавание фото (Vision) и embeddings.

Если OPENAI_API_KEY не задан или вызов упал — отдаём безопасный фолбэк,
чтобы демо никогда не падало.
"""
import base64
import hashlib
import json
import math

from .config import settings
from .models import PROBLEM_TYPES, SEVERITIES

_client = None


def _get_client():
    global _client
    if _client is None and settings.has_openai:
        from openai import OpenAI

        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


VISION_PROMPT = (
    "Ты классифицируешь городские инфраструктурные проблемы на фото для приложения "
    "CityEye (Алматы). Верни СТРОГО JSON без markdown и пояснений в формате:\n"
    '{"type": <one of: pothole, garbage, streetlight, graffiti, sign, other>, '
    '"severity": <one of: low, medium, high>, '
    '"description": <короткое описание на русском, до 120 символов>}\n'
    "type — что на фото (яма/мусор/фонарь/граффити/знак). "
    "severity — насколько опасно/срочно. Только JSON."
)


def _safe_parse(raw: str) -> dict:
    """Безопасно вытащить JSON-объект из ответа модели."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
    start, end = raw.find("{"), raw.rfind("}")
    if start != -1 and end != -1:
        raw = raw[start : end + 1]
    data = json.loads(raw)
    ptype = str(data.get("type", "other")).lower()
    sev = str(data.get("severity", "medium")).lower()
    return {
        "type": ptype if ptype in PROBLEM_TYPES else "other",
        "severity": sev if sev in SEVERITIES else "medium",
        "description": str(data.get("description", "")).strip()[:200],
    }


def analyze_photo(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    client = _get_client()
    if client is None:
        return _mock_analysis(image_bytes)
    try:
        b64 = base64.b64encode(image_bytes).decode()
        resp = client.chat.completions.create(
            model=settings.openai_vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{content_type};base64,{b64}"},
                        },
                    ],
                }
            ],
            max_tokens=200,
            temperature=0,
        )
        return _safe_parse(resp.choices[0].message.content)
    except Exception as exc:  # noqa: BLE001
        print(f"[ai] vision failed, using mock: {exc}")
        return _mock_analysis(image_bytes)


def embed(text: str) -> list[float]:
    client = _get_client()
    if client is None:
        return _mock_embed(text)
    try:
        resp = client.embeddings.create(
            model=settings.openai_embed_model, input=text
        )
        return resp.data[0].embedding
    except Exception as exc:  # noqa: BLE001
        print(f"[ai] embed failed, using mock: {exc}")
        return _mock_embed(text)


# --- mock-режим (без ключа): детерминированный, чтобы дедуп всё равно работал ---

_MOCK_TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign"]


def _mock_analysis(image_bytes: bytes) -> dict:
    h = int(hashlib.md5(image_bytes).hexdigest(), 16)
    ptype = _MOCK_TYPES[h % len(_MOCK_TYPES)]
    severity = SEVERITIES[(h >> 8) % len(SEVERITIES)]
    labels = {
        "pothole": "Яма на проезжей части",
        "garbage": "Несанкционированная свалка мусора",
        "streetlight": "Неработающий уличный фонарь",
        "graffiti": "Граффити на фасаде",
        "sign": "Повреждённый дорожный знак",
    }
    return {"type": ptype, "severity": severity, "description": labels[ptype]}


def _mock_embed(text: str, dim: int = 96) -> list[float]:
    """Детерминированный псевдо-embedding из текста (нормированный).

    Первый токен — это тип проблемы (вход всегда "type. description"), и он
    получает доминирующий вес. Благодаря этому в mock-режиме (без ключа) две
    заявки одного типа рядом гарантированно дают cosine >= 0.85 и объединяются,
    а заявки разных типов — нет. Реальные OpenAI-embeddings остаются
    полноценно семантическими.
    """
    vec = [0.0] * dim
    tokens = text.lower().split()
    for i, token in enumerate(tokens):
        idx = int(hashlib.md5(token.encode()).hexdigest(), 16) % dim
        vec[idx] += 8.0 if i == 0 else 1.0  # тип доминирует
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]
