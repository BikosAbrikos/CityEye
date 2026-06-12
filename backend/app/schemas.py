from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RegisterIn(BaseModel):
    username: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut


class DistrictOut(BaseModel):
    id: int
    name: str
    geometry: list
    centroid_lat: float
    centroid_lng: float
    index_score: float
    open_problems: int
    bucket: str

    class Config:
        from_attributes = True


class ProblemOut(BaseModel):
    id: int
    type: str
    severity: str
    description: str
    lat: float
    lng: float
    photo_url: str | None
    status: str
    district_id: int | None
    user_id: int | None
    duplicate_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyzeOut(BaseModel):
    type: str
    severity: str
    description: str


class ReportOut(BaseModel):
    merged: bool
    similar_count: int
    problem: ProblemOut


class StatsOut(BaseModel):
    total_open: int
    by_severity: dict
    merged_reports: int
    districts: int


class StatusUpdateIn(BaseModel):
    status: str
