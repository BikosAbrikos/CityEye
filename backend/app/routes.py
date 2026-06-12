import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import model as ai_model
from .auth import (
    create_token, get_current_user_optional, hash_password,
    require_admin, require_user, verify_password,
)
from .db import get_db
from .dedup import find_duplicate
from .index import assign_district, bucket_for, recalc_district
from .models import ACTIVE_STATUSES, SEVERITIES, STATUSES, District, Problem, User
from .schemas import (
    AnalyzeOut, DistrictOut, LoginIn, ProblemOut,
    RegisterIn, ReportOut, StatsOut, StatusUpdateIn, TokenOut, UserOut,
)

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── AUTH ─────────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=TokenOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email уже зарегистрирован")
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, "Имя пользователя занято")
    if len(body.password) < 6:
        raise HTTPException(400, "Пароль минимум 6 символов")

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(token=create_token(user.id), user=user)


@router.post("/auth/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    return TokenOut(token=create_token(user.id), user=user)


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(require_user)):
    return user


# ── КАРТА / ДАННЫЕ ────────────────────────────────────────────────────────────

@router.get("/districts", response_model=list[DistrictOut])
def list_districts(db: Session = Depends(get_db)):
    out = []
    for d in db.query(District).all():
        open_count = (
            db.query(func.count(Problem.id))
            .filter(Problem.district_id == d.id, Problem.status.in_(ACTIVE_STATUSES))
            .scalar()
        )
        out.append(DistrictOut(
            id=d.id, name=d.name, geometry=d.geometry,
            centroid_lat=d.centroid_lat, centroid_lng=d.centroid_lng,
            index_score=d.index_score, open_problems=open_count,
            bucket=bucket_for(d.index_score),
        ))
    out.sort(key=lambda x: x.index_score)
    return out


@router.get("/problems", response_model=list[ProblemOut])
def list_problems(
    status: str | None = None,
    type: str | None = None,
    severity: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Problem)
    if status:
        q = q.filter(Problem.status == status)
    if type:
        q = q.filter(Problem.type == type)
    if severity:
        q = q.filter(Problem.severity == severity)
    return q.order_by(Problem.created_at.desc()).all()


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    by_sev = {}
    for sev in SEVERITIES:
        by_sev[sev] = (
            db.query(func.count(Problem.id))
            .filter(Problem.status.in_(ACTIVE_STATUSES), Problem.severity == sev)
            .scalar()
        )
    merged = db.query(func.coalesce(func.sum(Problem.duplicate_count), 0)).scalar()
    districts = db.query(func.count(District.id)).scalar()
    return StatsOut(
        total_open=sum(by_sev.values()),
        by_severity=by_sev,
        merged_reports=int(merged or 0),
        districts=districts,
    )


# ── МОИ ЗАЯВКИ (личный кабинет) ───────────────────────────────────────────────

@router.get("/my-reports", response_model=list[ProblemOut])
def my_reports(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Problem)
        .filter(Problem.user_id == user.id)
        .order_by(Problem.created_at.desc())
        .all()
    )


# ── AI: АНАЛИЗ ФОТО ───────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeOut)
async def analyze(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(400, "Пустой файл")
    result = ai_model.analyze_photo(data, file.content_type or "image/jpeg")
    return AnalyzeOut(**result)


# ── СОЗДАТЬ ЗАЯВКУ ────────────────────────────────────────────────────────────

@router.post("/reports", response_model=ReportOut)
async def create_report(
    file: UploadFile | None = File(None),
    lat: float = Form(...),
    lng: float = Form(...),
    type: str = Form(...),
    severity: str = Form(...),
    description: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    photo_url = None
    if file is not None:
        data = await file.read()
        if data:
            ext = os.path.splitext(file.filename or "")[1] or ".jpg"
            fname = f"{uuid.uuid4().hex}{ext}"
            with open(os.path.join(UPLOAD_DIR, fname), "wb") as f:
                f.write(data)
            photo_url = f"/uploads/{fname}"

    embedding = ai_model.embed(f"{type}. {description}")

    dup = find_duplicate(db, type, lat, lng, embedding)
    if dup is not None:
        dup.duplicate_count += 1
        db.commit()
        db.refresh(dup)
        return ReportOut(merged=True, similar_count=dup.duplicate_count, problem=dup)

    district_id = assign_district(db, lat, lng)
    problem = Problem(
        type=type, severity=severity, description=description,
        lat=lat, lng=lng, photo_url=photo_url,
        status="pending",
        district_id=district_id,
        user_id=current_user.id if current_user else None,
        embedding=embedding,
        duplicate_count=0,
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    if district_id:
        recalc_district(db, district_id)
    return ReportOut(merged=False, similar_count=0, problem=problem)


# ── ОБНОВИТЬ СТАТУС (только администратор) ────────────────────────────────────

@router.patch("/problems/{problem_id}/status", response_model=ProblemOut)
def update_status(
    problem_id: int,
    body: StatusUpdateIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if body.status not in STATUSES:
        raise HTTPException(400, f"Статус должен быть одним из: {', '.join(STATUSES)}")
    p = db.get(Problem, problem_id)
    if p is None:
        raise HTTPException(404, "Заявка не найдена")
    p.status = body.status
    db.commit()
    if p.district_id:
        recalc_district(db, p.district_id)
    db.refresh(p)
    return p


# ── LEGACY: /resolve (обратная совместимость) ─────────────────────────────────

@router.post("/problems/{problem_id}/resolve", response_model=ProblemOut)
def resolve_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    p = db.get(Problem, problem_id)
    if p is None:
        raise HTTPException(404, "Заявка не найдена")
    p.status = "completed"
    db.commit()
    if p.district_id:
        recalc_district(db, p.district_id)
    db.refresh(p)
    return p
