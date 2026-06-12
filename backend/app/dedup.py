"""Дедупликация заявок: похожая открытая проблема того же типа рядом."""
import math

from sqlalchemy.orm import Session

from .models import Problem

RADIUS_M = 80.0
SIM_THRESHOLD = 0.85


def haversine_m(lat1, lng1, lat2, lng2) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def find_duplicate(
    db: Session, ptype: str, lat: float, lng: float, embedding: list[float]
) -> Problem | None:
    """Вернёт открытую проблему-кандидата для объединения, либо None."""
    candidates = (
        db.query(Problem)
        .filter(Problem.status == "open", Problem.type == ptype)
        .all()
    )
    best, best_sim = None, SIM_THRESHOLD
    for c in candidates:
        if haversine_m(lat, lng, c.lat, c.lng) > RADIUS_M:
            continue
        sim = cosine(embedding, c.embedding or [])
        if sim >= best_sim:
            best, best_sim = c, sim
    return best
