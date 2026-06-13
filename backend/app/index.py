from shapely.geometry import Point, Polygon
from sqlalchemy.orm import Session

from .models import SEVERITY_WEIGHTS, District, Problem

GOOD_THRESHOLD = 70.0
MID_THRESHOLD  = 40.0

# Базовый индекс района — РЕАЛЬНЫЕ данные мини-ресёрча по Алматы (2024–2026).
# Источник: docs/almaty_district_research.md (compass artifact). Это «состояние
# на сегодня». Новые необработанные заявки временно опускают индекс ниже базы.
RESEARCH_BASE = {
    "Алмалинский":   71.0,
    "Бостандыкский": 63.0,
    "Медеуский":     63.0,
    "Ауэзовский":    59.0,
    "Турксибский":   52.0,
    "Алатауский":    41.0,
}

# Насколько одна НЕОБРАБОТАННАЯ (pending) заявка снижает индекс района.
# Взятая в работу / закрытая заявка штраф снимает — район «восстанавливается».
PENALTY_SCALE = 3.0
PENDING_STATUSES = ("open", "pending")


def bucket_for(score: float) -> str:
    if score >= GOOD_THRESHOLD:
        return "good"
    if score >= MID_THRESHOLD:
        return "mid"
    return "poor"


def _polygon(district: District) -> Polygon:
    ring = district.geometry[0]
    return Polygon([(lng, lat) for lng, lat in ring])


def assign_district(db: Session, lat: float, lng: float) -> int | None:
    pt = Point(lng, lat)
    best_id, best_dist = None, None
    for d in db.query(District).all():
        poly = _polygon(d)
        if poly.contains(pt):
            return d.id
        dist = (d.centroid_lat - lat) ** 2 + (d.centroid_lng - lng) ** 2
        if best_dist is None or dist < best_dist:
            best_id, best_dist = d.id, dist
    return best_id


def pending_load(db: Session, district_id: int) -> float:
    """Сумма весов НЕОБРАБОТАННЫХ (pending/open) заявок района."""
    problems = (
        db.query(Problem)
        .filter(
            Problem.district_id == district_id,
            Problem.status.in_(PENDING_STATUSES),
        )
        .all()
    )
    return sum(SEVERITY_WEIGHTS.get(p.severity, 1) for p in problems)


def recalc_district(db: Session, district_id: int) -> None:
    d = db.get(District, district_id)
    if d is None:
        return
    base = RESEARCH_BASE.get(d.name, 100.0)
    score = base - pending_load(db, district_id) * PENALTY_SCALE
    d.index_score = max(0.0, min(100.0, round(score, 1)))
    db.commit()


def recalc_all(db: Session) -> None:
    for d in db.query(District).all():
        recalc_district(db, d.id)
