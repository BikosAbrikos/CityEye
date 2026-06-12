from pydantic import BaseModel


class DistrictOut(BaseModel):
    id: int
    name: str
    geometry: list
    centroid_lat: float
    centroid_lng: float
    index_score: float
    open_problems: int
    bucket: str  # good | mid | poor

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
    duplicate_count: int

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
