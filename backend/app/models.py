from datetime import datetime

from sqlalchemy import (
    JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

# ── Допустимые значения (используют AI-слой и API) ──────────────────────────

PROBLEM_TYPES = ["pothole", "garbage", "streetlight", "graffiti", "sign", "other"]
SEVERITIES    = ["low", "medium", "high"]
SEVERITY_WEIGHTS = {"low": 1, "medium": 3, "high": 6}

# Жизненный цикл заявки:
#   pending   → заявка принята, ждёт рассмотрения
#   in_process → администратор взял в работу
#   completed  → проблема устранена (не учитывается в индексе)
#   rejected   → заявка отклонена   (не учитывается в индексе)
#   open       → legacy-статус (= pending), оставлен для совместимости с сидом
STATUSES = ["open", "pending", "in_process", "completed", "rejected"]
ACTIVE_STATUSES = ("open", "pending", "in_process")  # учитываются в индексе района


# ── Модели ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(300), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    problems: Mapped[list["Problem"]] = relationship(back_populates="user")


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    geometry: Mapped[list] = mapped_column(JSON, nullable=False)
    centroid_lat: Mapped[float] = mapped_column(Float, nullable=False)
    centroid_lng: Mapped[float] = mapped_column(Float, nullable=False)
    index_score: Mapped[float] = mapped_column(Float, default=100.0)

    problems: Mapped[list["Problem"]] = relationship(back_populates="district")


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[str] = mapped_column(String(40), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    embedding: Mapped[list | None] = mapped_column(JSON, nullable=True)
    duplicate_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    district: Mapped["District"] = relationship(back_populates="problems")
    user: Mapped["User | None"] = relationship(back_populates="problems")
