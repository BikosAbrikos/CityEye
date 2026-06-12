import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import ai
from .db import get_db
from .dedup import find_duplicate
from .index import assign_district, bucket_for, recalc_district
from .models import Problem, District, SEVERITIES
from .schemas import (
    AnalyzeOut,
    DistrictOut,
    ProblemOut,
    ReportOut,
    StatsOut,
)

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/districts", response_model=list[DistrictOut])
def list_districts(db: Session = Depends(get_db)):
    out = []
    for d in db.query(District).all():
        open_count = (
            db.query(func.count(Problem.id))
            .filter(Problem.district_id == d.id, Problem.status == "open")
            .scalar()
        )
        out.append(
            DistrictOut(
                id=d.id,
                name=d.name,
                geometry=d.geometry,
                centroid_lat=d.centroid_lat,
                centroid_lng=d.centroid_lng,
                index_score=d.index_score,
                open_problems=open_count,
                bucket=bucket_for(d.index_score),
            )
        )
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
            .filter(Problem.status == "open", Problem.severity == sev)
            .scalar()
        )
    total_open = sum(by_sev.values())
    merged = db.query(func.coalesce(func.sum(Problem.duplicate_count), 0)).scalar()
    districts = db.query(func.count(District.id)).scalar()
    return StatsOut(
        total_open=total_open,
        by_severity=by_sev,
        merged_reports=int(merged or 0),
        districts=districts,
    )


@router.post("/analyze", response_model=AnalyzeOut)
async def analyze(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(400, "Пустой файл")
    result = ai.analyze_photo(data, file.content_type or "image/jpeg")
    return AnalyzeOut(**result)


@router.post("/reports", response_model=ReportOut)
async def create_report(
    file: UploadFile | None = File(None),
    lat: float = Form(...),
    lng: float = Form(...),
    type: str = Form(...),
    severity: str = Form(...),
    description: str = Form(""),
    db: Session = Depends(get_db),
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

    embedding = ai.embed(f"{type}. {description}")

    # Дедуп: ищем похожую открытую проблему рядом.
    dup = find_duplicate(db, type, lat, lng, embedding)
    if dup is not None:
        dup.duplicate_count += 1
        db.commit()
        db.refresh(dup)
        return ReportOut(
            merged=True, similar_count=dup.duplicate_count, problem=dup
        )

    district_id = assign_district(db, lat, lng)
    problem = Problem(
        type=type,
        severity=severity,
        description=description,
        lat=lat,
        lng=lng,
        photo_url=photo_url,
        status="open",
        district_id=district_id,
        embedding=embedding,
        duplicate_count=0,
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    if district_id:
        recalc_district(db, district_id)
    return ReportOut(merged=False, similar_count=0, problem=problem)


@router.post("/problems/{problem_id}/resolve", response_model=ProblemOut)
def resolve_problem(problem_id: int, db: Session = Depends(get_db)):
    p = db.get(Problem, problem_id)
    if p is None:
        raise HTTPException(404, "Проблема не найдена")
    p.status = "resolved"
    db.commit()
    if p.district_id:
        recalc_district(db, p.district_id)
    db.refresh(p)
    return p
