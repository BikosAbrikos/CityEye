"""
auth.py — авторизация CityEye (JWT + хэш паролей)

Используется встроенный hashlib (без внешних зависимостей для хэширования).
JWT — через PyJWT.
"""

import hashlib
import os
from datetime import datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings
from .db import get_db
from .models import User
from sqlalchemy.orm import Session

# Bearer-схема: клиент шлёт "Authorization: Bearer <token>"
_bearer = HTTPBearer(auto_error=False)

TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"


# ── Пароли ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """PBKDF2-SHA256 с солью. Формат: 'hex_salt:hex_hash'"""
    salt = os.urandom(16).hex()
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return f"{salt}:{h}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        salt, h = stored.split(":", 1)
        return hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 200_000).hex() == h
    except Exception:
        return False


# ── JWT ──────────────────────────────────────────────────────────────────────

def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def _decode_token(token: str) -> int | None:
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        return int(data["sub"])
    except Exception:
        return None


# ── FastAPI-зависимости ───────────────────────────────────────────────────────

def get_current_user_optional(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    """Возвращает пользователя или None (для публичных эндпоинтов)."""
    if creds is None:
        return None
    user_id = _decode_token(creds.credentials)
    if user_id is None:
        return None
    return db.get(User, user_id)


def require_user(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    """Требует авторизации. Бросает 401 если нет токена."""
    if user is None:
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    return user


def require_admin(user: User = Depends(require_user)) -> User:
    """Требует роли admin. Бросает 403 иначе."""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Только для администраторов")
    return user
