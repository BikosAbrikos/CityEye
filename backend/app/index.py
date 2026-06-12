"""Индекс качества района и привязка точки к району."""
from shapely.geometry import Point, Polygon
from sqlalchemy.orm import Session

from .models import SEVERITY_WEIGHTS, District, Problem

GOOD_THRESHOLD = 70.0
MID_THRESHOLD = 40.0
# Множитель нагрузки: подобран так, чтобы сид-данные давали наглядный спред цветов
# (зелёный / янтарь / красный по районам).
LOAD_SCALE = 3.0


def bucket_for(score: float) -> str:
    if score >= GOOD_THRESHOLD:
        return "good"
    if score >= MID_THRESHOLD:
        return "mid"
    return "poor"


def _polygon(district: District) -> Polygon:
    # geometry: GeoJSON-кольца [[ [lng,lat], ... ]]; берём внешнее кольцо.
    ring = district.geometry[0]
    return Polygon([(lng, lat) for lng, lat in ring])


def assign_district(db: Session, lat: float, lng: float) -> int | None:
    pt = Point(lng, lat)
    best_id, best_dist = None, None
    for d in db.query(District).all():
        poly = _polygon(d)
        if poly.contains(pt):
            return d.id
        # запасной вариант — ближайший центроид, чтобы точка всегда попала в район
        dist = (d.centroid_lat - lat) ** 2 + (d.centroid_lng - lng) ** 2
        if best_dist is None or dist < best_dist:
            best_id, best_dist = d.id, dist
    return best_id


def district_load(db: Session, district_id: int) -> float:
    problems = (
        db.query(Problem)
        .filter(Problem.district_id == district_id, Problem.status == "open")
        .all()
    )
    return sum(SEVERITY_WEIGHTS.get(p.severity, 1) for p in problems)


def recalc_district(db: Session, district_id: int) -> None:
    d = db.get(District, district_id)
    if d is None:
        return
    load = district_load(db, district_id)
    score = 100.0 - load * LOAD_SCALE
    d.index_score = max(0.0, min(100.0, round(score, 1)))
    db.commit()


def recalc_all(db: Session) -> None:
    for d in db.query(District).all():
        recalc_district(db, d.id)
