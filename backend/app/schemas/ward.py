"""
Ward schemas.
"""
from typing import Any
from sqlmodel import SQLModel


class WardCreateRequest(SQLModel):
    name: str
    code: str
    description: str | None = None
    boundaryGeoJson: Optional[dict[str, Any]] = None
    centerLatitude: float | None = None
    centerLongitude: float | None = None


class WardResponse(SQLModel):
    id: str
    name: str
    code: str
    description: str | None = None
    centerLatitude: float | None = None
    centerLongitude: float | None = None
    status: str = "ACTIVE"
