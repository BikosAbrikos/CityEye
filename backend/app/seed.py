"""Сид районов и проблем Алматы.

Запуск:  python -m app.seed
Создаёт ~6 районов и ~25 проблем с реальными координатами Алматы.
Один кейс с ямой намеренно имеет duplicate_count, а рядом легко
воспроизвести дедуп живьём через /report.
"""
from . import ai
from .db import SessionLocal, init_db
from .index import recalc_all
from .models import District, Problem


def _rect(clng, clat, dlng, dlat):
    """GeoJSON-полигон (прямоугольник) вокруг центра. Координаты [lng, lat]."""
    return [
        [
            [clng - dlng, clat - dlat],
            [clng + dlng, clat - dlat],
            [clng + dlng, clat + dlat],
            [clng - dlng, clat + dlat],
            [clng - dlng, clat - dlat],
        ]
    ]


# name, centroid_lng, centroid_lat, half-width(lng), half-height(lat)
DISTRICTS = [
    ("Алмалинский", 76.9286, 43.2567, 0.022, 0.013),
    ("Бостандыкский", 76.9050, 43.2050, 0.030, 0.018),
    ("Медеуский", 76.9620, 43.2280, 0.028, 0.020),
    ("Ауэзовский", 76.8550, 43.2250, 0.030, 0.020),
    ("Турксибский", 76.9450, 43.3000, 0.030, 0.022),
    ("Алатауский", 76.8700, 43.3050, 0.035, 0.025),
]

# type, severity, description, lat, lng
# Серьёзности подобраны так, чтобы районы дали наглядный спред индекса:
# Медеуский/Бостандыкский — зелёные, Алмалинский/Турксибский — янтарь,
# Ауэзовский/Алатауский — красные.
PROBLEMS = [
    # --- Алмалинский (умеренная нагрузка) ---
    ("pothole", "low", "Выбоина на ул. Абая у Фурманова", 43.2580, 76.9290),
    ("garbage", "low", "Переполненные баки во дворе", 43.2545, 76.9250),
    ("streetlight", "low", "Не горит фонарь у сквера", 43.2600, 76.9330),
    ("graffiti", "medium", "Граффити на фасаде жилого дома", 43.2555, 76.9210),
    # --- Бостандыкский (зелёный) ---
    ("pothole", "low", "Небольшая яма на проспекте аль-Фараби", 43.2080, 76.9100),
    ("garbage", "medium", "Мусор у рынка", 43.2020, 76.8980),
    ("sign", "medium", "Сбит дорожный знак на перекрёстке", 43.2120, 76.9150),
    ("streetlight", "low", "Тёмный участок вдоль аллеи", 43.2000, 76.9050),
    ("graffiti", "low", "Теги на остановке", 43.2055, 76.9120),
    # --- Медеуский (самый зелёный) ---
    ("pothole", "low", "Небольшая выбоина у Достык", 43.2300, 76.9580),
    ("garbage", "low", "Мусор у входа в парк", 43.2250, 76.9650),
    ("streetlight", "low", "Мигает один фонарь", 43.2330, 76.9600),
    ("sign", "low", "Выцвел знак пешеходного перехода", 43.2270, 76.9550),
    # --- Ауэзовский (красный) ---
    ("pothole", "high", "Крупная яма на ул. Алтынсарина", 43.2230, 76.8520),
    ("garbage", "high", "Несанкционированная свалка во дворе", 43.2280, 76.8600),
    ("streetlight", "high", "Не работает освещение у школы", 43.2200, 76.8480),
    ("graffiti", "medium", "Вандализм на детской площадке", 43.2250, 76.8560),
    # --- Турксибский (янтарь) ---
    ("pothole", "medium", "Яма у железнодорожного вокзала", 43.3010, 76.9460),
    ("garbage", "high", "Завалы мусора у гаражей", 43.2980, 76.9400),
    ("sign", "medium", "Повреждён знак на оживлённом перекрёстке", 43.3030, 76.9500),
    ("streetlight", "low", "Мигает фонарь у дома", 43.2960, 76.9430),
    # --- Алатауский (красный) ---
    ("pothole", "high", "Разбитая дорога в новом микрорайоне", 43.3060, 76.8700),
    ("garbage", "high", "Не вывозят мусор неделю", 43.3020, 76.8650),
    ("streetlight", "high", "Нет освещения на целой улице", 43.3090, 76.8750),
    ("sign", "medium", "Отсутствует знак ограничения скорости", 43.3040, 76.8600),
]

# Демонстрация дедупа: одна яма, про которую уже «объединили» 2 заявки.
# Рядом (в пределах 80 м) можно отправить новую заявку через /report — она сольётся.
DEDUP_CASE = {
    "type": "pothole",
    "severity": "high",
    "description": "Огромная яма на ул. Толе би возле остановки",
    "lat": 43.2510,
    "lng": 76.9450,
    "duplicate_count": 2,
}


def run():
    init_db()
    db = SessionLocal()
    try:
        # чистый сид
        db.query(Problem).delete()
        db.query(District).delete()
        db.commit()

        name_to_id = {}
        for name, clng, clat, dlng, dlat in DISTRICTS:
            d = District(
                name=name,
                geometry=_rect(clng, clat, dlng, dlat),
                centroid_lat=clat,
                centroid_lng=clng,
                index_score=100.0,
            )
            db.add(d)
            db.flush()
            name_to_id[name] = d.id
        db.commit()

        from .index import assign_district

        def add_problem(ptype, sev, desc, lat, lng, dup=0):
            emb = ai.embed(f"{ptype}. {desc}")
            did = assign_district(db, lat, lng)
            db.add(
                Problem(
                    type=ptype,
                    severity=sev,
                    description=desc,
                    lat=lat,
                    lng=lng,
                    status="open",
                    district_id=did,
                    embedding=emb,
                    duplicate_count=dup,
                )
            )

        for ptype, sev, desc, lat, lng in PROBLEMS:
            add_problem(ptype, sev, desc, lat, lng)

        add_problem(
            DEDUP_CASE["type"],
            DEDUP_CASE["severity"],
            DEDUP_CASE["description"],
            DEDUP_CASE["lat"],
            DEDUP_CASE["lng"],
            dup=DEDUP_CASE["duplicate_count"],
        )
        db.commit()

        recalc_all(db)

        n_d = db.query(District).count()
        n_p = db.query(Problem).count()
        print(f"[seed] готово: районов={n_d}, проблем={n_p}")
        print(
            "[seed] кейс дедупа: отправь на /report яму рядом с "
            f"({DEDUP_CASE['lat']}, {DEDUP_CASE['lng']}) — она объединится."
        )
    finally:
        db.close()


if __name__ == "__main__":
    run()
