import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .db import Base, SessionLocal, engine, init_db
from .routes import router

app = FastAPI(title="CityEye API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _heal_schema():
    """Лечит схему после деплоя новой версии поверх старой БД.

    create_all не добавляет колонки в существующие таблицы, поэтому
    если таблица problems создана старым кодом (без user_id/embedding),
    любой SELECT по ней падает 500. Проверяем колонку-маркер и при
    несовпадении пересоздаём только problems/districts — users не трогаем.
    """
    from .models import District, Problem

    db = SessionLocal()
    try:
        db.query(Problem.user_id).first()
        return
    except Exception:
        db.rollback()
        print("[startup] схема problems устарела — пересоздаю problems/districts")
    finally:
        db.close()

    Problem.__table__.drop(engine, checkfirst=True)
    District.__table__.drop(engine, checkfirst=True)
    Base.metadata.create_all(bind=engine)


def _auto_seed():
    """Сидит пустую базу (свежий деплой / после _heal_schema)."""
    from .models import District

    db = SessionLocal()
    try:
        empty = db.query(District).count() == 0
    finally:
        db.close()
    if empty:
        from . import seed
        print("[startup] база пустая — запускаю сид")
        seed.run()


@app.on_event("startup")
def _startup():
    init_db()
    _heal_schema()
    _auto_seed()


@app.get("/api/health")
def health():
    from .config import settings
    return {
        "status": "ok",
        "supabase_url_set": bool(settings.supabase_url),
        "supabase_key_set": bool(settings.supabase_service_key),
        "openai_set": settings.has_openai,
    }
