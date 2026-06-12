"""Сид: 6 районов Алматы, 26 проблем, 1 admin-пользователь.

Запуск: python -m app.seed
"""
from . import model as ai_model
from .auth import hash_password
from .db import SessionLocal, init_db
from .index import recalc_all
from .models import District, Problem, User


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

# (type, severity, description, lat, lng, status)
PROBLEMS = [
    # Алмалинский — умеренная нагрузка
    ("pothole",     "low",    "Выбоина на ул. Абая у Фурманова",           43.2580, 76.9290, "pending"),
    ("garbage",     "low",    "Переполненные баки во дворе",               43.2545, 76.9250, "in_process"),
    ("streetlight", "low",    "Не горит фонарь у сквера",                  43.2600, 76.9330, "completed"),
    ("graffiti",    "medium", "Граффити на фасаде жилого дома",            43.2555, 76.9210, "pending"),
    # Бостандыкский — зелёный
    ("pothole",     "low",    "Небольшая яма на проспекте аль-Фараби",     43.2080, 76.9100, "pending"),
    ("garbage",     "medium", "Мусор у рынка",                             43.2020, 76.8980, "in_process"),
    ("sign",        "medium", "Сбит дорожный знак на перекрёстке",         43.2120, 76.9150, "pending"),
    ("streetlight", "low",    "Тёмный участок вдоль аллеи",                43.2000, 76.9050, "completed"),
    ("graffiti",    "low",    "Теги на остановке",                         43.2055, 76.9120, "rejected"),
    # Медеуский — самый зелёный
    ("pothole",     "low",    "Небольшая выбоина у Достык",                43.2300, 76.9580, "completed"),
    ("garbage",     "low",    "Мусор у входа в парк",                      43.2250, 76.9650, "pending"),
    ("streetlight", "low",    "Мигает один фонарь",                        43.2330, 76.9600, "in_process"),
    ("sign",        "low",    "Выцвел знак пешеходного перехода",          43.2270, 76.9550, "pending"),
    # Ауэзовский — красный
    ("pothole",     "high",   "Крупная яма на ул. Алтынсарина",            43.2230, 76.8520, "pending"),
    ("garbage",     "high",   "Несанкционированная свалка во дворе",       43.2280, 76.8600, "in_process"),
    ("streetlight", "high",   "Не работает освещение у школы",             43.2200, 76.8480, "pending"),
    ("graffiti",    "medium", "Вандализм на детской площадке",             43.2250, 76.8560, "pending"),
    # Турксибский — янтарь
    ("pothole",     "medium", "Яма у железнодорожного вокзала",            43.3010, 76.9460, "pending"),
    ("garbage",     "high",   "Завалы мусора у гаражей",                   43.2980, 76.9400, "in_process"),
    ("sign",        "medium", "Повреждён знак на оживлённом перекрёстке",  43.3030, 76.9500, "pending"),
    ("streetlight", "low",    "Мигает фонарь у дома",                      43.2960, 76.9430, "completed"),
    # Алатауский — красный
    ("pothole",     "high",   "Разбитая дорога в новом микрорайоне",       43.3060, 76.8700, "pending"),
    ("garbage",     "high",   "Не вывозят мусор неделю",                   43.3020, 76.8650, "in_process"),
    ("streetlight", "high",   "Нет освещения на целой улице",              43.3090, 76.8750, "pending"),
    ("sign",        "medium", "Отсутствует знак ограничения скорости",     43.3040, 76.8600, "pending"),
]

# Демо-яма для дедупа (уже с 2 «объединёнными» дубликатами)
DEDUP_CASE = {
    "type": "pothole", "severity": "high",
    "description": "Огромная яма на ул. Толе би возле остановки",
    "lat": 43.2510, "lng": 76.9450, "status": "in_process",
}


def run():
    init_db()
    db = SessionLocal()
    try:
        db.query(Problem).delete()
        db.query(District).delete()
        # Сохраняем пользователей — не удаляем при пересиде
        db.commit()

        # Создаём районы
        for name, clng, clat, dlng, dlat in DISTRICTS:
            db.add(District(
                name=name, geometry=_rect(clng, clat, dlng, dlat),
                centroid_lat=clat, centroid_lng=clng, index_score=100.0,
            ))
        db.commit()

        # Создаём проблемы
        from .index import assign_district
        for ptype, sev, desc, lat, lng, status in PROBLEMS:
            emb = ai_model.embed(f"{ptype}. {desc}")
            did = assign_district(db, lat, lng)
            db.add(Problem(
                type=ptype, severity=sev, description=desc,
                lat=lat, lng=lng, status=status,
                district_id=did, embedding=emb,
            ))

        # Демо-яма с дедупом
        emb = ai_model.embed(f"{DEDUP_CASE['type']}. {DEDUP_CASE['description']}")
        did = assign_district(db, DEDUP_CASE["lat"], DEDUP_CASE["lng"])
        db.add(Problem(
            type=DEDUP_CASE["type"], severity=DEDUP_CASE["severity"],
            description=DEDUP_CASE["description"],
            lat=DEDUP_CASE["lat"], lng=DEDUP_CASE["lng"],
            status=DEDUP_CASE["status"], district_id=did,
            embedding=emb, duplicate_count=2,
        ))
        db.commit()

        # Пересчёт индексов
        recalc_all(db)

        # Создаём admin-пользователя (если ещё нет)
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
        print(f"[seed] готово: районов={len(DISTRICTS)}, проблем={n_p}")
        print(f"[seed] деdup-кейс: яма на Толе би ({DEDUP_CASE['lat']}, {DEDUP_CASE['lng']})")
    finally:
        db.close()


if __name__ == "__main__":
    run()
