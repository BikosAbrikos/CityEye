"""Сид: 6 районов Алматы + компактный набор демо-заявок + admin.

Заявки намеренно «старые» (дата в прошлом) и НЕ в статусе pending —
они уже в работе или закрыты. Так фильтр «Новые» в кабинете акимата
остаётся пустым, и живые заявки, отправленные на защите, видны сразу.

Запуск: python -m app.seed
"""
from datetime import datetime, timedelta

from . import model as ai_model
from .auth import hash_password
from .db import SessionLocal, init_db
from .index import recalc_all
from .models import District, Message, Problem, User


def _rect(clng, clat, dlng, dlat):
    return [[
        [clng - dlng, clat - dlat], [clng + dlng, clat - dlat],
        [clng + dlng, clat + dlat], [clng - dlng, clat + dlat],
        [clng - dlng, clat - dlat],
    ]]


DISTRICTS = [
    ("Алмалинский",    76.9286, 43.2567, 0.022, 0.013),
    ("Бостандыкский",  76.9050, 43.2050, 0.030, 0.018),
    ("Медеуский",      76.9620, 43.2280, 0.028, 0.020),
    ("Ауэзовский",     76.8550, 43.2250, 0.030, 0.020),
    ("Турксибский",    76.9450, 43.3000, 0.030, 0.022),
    ("Алатауский",     76.8700, 43.3050, 0.035, 0.025),
]

# (type, severity, description, lat, lng, status, age_days)
# Заявки отражают реальные находки ресёрча по районам. Все «старые» и НЕ pending
# (in_process / completed / rejected), поэтому фильтр «Новые» пуст, а индекс в
# покое равен базовым значениям из RESEARCH_BASE (index.py).
PROBLEMS = [
    # Алмалинский (база 71) — лучший центр, мелочи
    ("streetlight", "low",    "Не горит фонарь у сквера на Абая",                43.2600, 76.9330, "in_process",  9),
    ("graffiti",    "low",    "Граффити на фасаде в центре — закрашено",         43.2555, 76.9210, "completed",  30),
    # Бостандыкский (63) — жалобы на освещение
    ("streetlight", "medium", "Жалобы на негорящие фонари во дворах",            43.2080, 76.9100, "in_process",  8),
    ("garbage",     "low",    "Переполнен бак у рынка — вывезено",               43.2020, 76.8980, "completed",  25),
    # Медеуский (63) — горные мкр, вода/дороги
    ("pothole",     "high",   "Размытая дорога в мкр Каменское плато",           43.2300, 76.9580, "in_process", 14),
    ("sign",        "low",    "Выцвел знак перехода у Достык — заменён",         43.2270, 76.9550, "completed",  35),
    # Ауэзовский (59) — плотный, Сайран
    ("garbage",     "high",   "Санитарное состояние у автовокзала Сайран",       43.2230, 76.8520, "in_process", 10),
    ("pothole",     "medium", "Ямы во дворах старого жилфонда",                  43.2280, 76.8600, "in_process", 17),
    # Турксибский (52) — свалки, ветхое жильё, воздух
    ("garbage",     "high",   "Стихийная свалка в мкр Кайрат (ул. Челюскин)",    43.3010, 76.9460, "in_process", 12),
    ("pothole",     "high",   "Разбитая дорога в промзоне",                      43.3030, 76.9500, "in_process", 19),
    # Алатауский (41) — грунтовки, нет освещения, дефицит сетей
    ("pothole",     "high",   "Грунтовая дорога без асфальта (мкр Рахат)",       43.3060, 76.8700, "in_process", 21),
    ("streetlight", "high",   "Нет уличного освещения на улице",                 43.3090, 76.8750, "in_process",  7),
    ("garbage",     "high",   "Стихийная свалка в частном секторе",              43.3020, 76.8650, "in_process", 15),
]

# Демо-яма для дедупа (старая, уже в работе, с 2 «объединёнными» дублями)
DEDUP_CASE = {
    "type": "pothole", "severity": "high",
    "description": "Огромная яма на ул. Толе би возле остановки",
    "lat": 43.2510, "lng": 76.9450, "status": "in_process", "age_days": 16,
}


def _ago(days):
    return datetime.utcnow() - timedelta(days=days)


def run():
    init_db()
    db = SessionLocal()
    try:
        # Чистим заявки и их сообщения (FK), районы оставляем пересоздать.
        # Пользователей НЕ трогаем.
        db.query(Message).delete()
        db.query(Problem).delete()
        db.query(District).delete()
        db.commit()

        for name, clng, clat, dlng, dlat in DISTRICTS:
            db.add(District(
                name=name, geometry=_rect(clng, clat, dlng, dlat),
                centroid_lat=clat, centroid_lng=clng, index_score=100.0,
            ))
        db.commit()

        from .index import assign_district
        for ptype, sev, desc, lat, lng, status, age in PROBLEMS:
            emb = ai_model.embed(f"{ptype}. {desc}")
            did = assign_district(db, lat, lng)
            db.add(Problem(
                type=ptype, severity=sev, description=desc,
                lat=lat, lng=lng, status=status,
                district_id=did, embedding=emb,
                created_at=_ago(age),
            ))

        emb = ai_model.embed(f"{DEDUP_CASE['type']}. {DEDUP_CASE['description']}")
        did = assign_district(db, DEDUP_CASE["lat"], DEDUP_CASE["lng"])
        db.add(Problem(
            type=DEDUP_CASE["type"], severity=DEDUP_CASE["severity"],
            description=DEDUP_CASE["description"],
            lat=DEDUP_CASE["lat"], lng=DEDUP_CASE["lng"],
            status=DEDUP_CASE["status"], district_id=did,
            embedding=emb, duplicate_count=2,
            created_at=_ago(DEDUP_CASE["age_days"]),
        ))
        db.commit()

        recalc_all(db)

        if not db.query(User).filter(User.email == "admin@cityeye.kz").first():
            db.add(User(
                username="admin",
                email="admin@cityeye.kz",
                password_hash=hash_password("admin123"),
                is_admin=True,
            ))
            db.commit()
            print("[seed] admin создан: admin@cityeye.kz / admin123")
        else:
            print("[seed] admin уже существует")

        n_p = db.query(Problem).count()
        print(f"[seed] готово: районов={len(DISTRICTS)}, проблем={n_p} (все старые, без 'Новых')")
    finally:
        db.close()


if __name__ == "__main__":
    run()
