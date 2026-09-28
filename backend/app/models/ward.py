"""
Ward SQLModel Model.
"""
from typing import Any, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from .base import generate_uuid
from .associations import DepartmentWardLink

if TYPE_CHECKING:
    from .organization import Organization
    from .department import Department
    from .issue import Issue


class Ward(SQLModel, table=True):
    __tablename__ = "wards"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    name: str = Field(max_length=100)
    code: str = Field(max_length=50)
    description: str | None = None
    # GeoJSON boundary polygon for GPS-to-ward mapping
    boundary_geojson: Any | None = Field(default=None, sa_column=Column(JSON))
    # Centroid coordinates for proximity-based ward matching
    center_latitude: float | None = Field(default=None)
    center_longitude: float | None = Field(default=None)
    status: str = Field(default="ACTIVE", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    organization: Organization | None = Relationship(back_populates="wards")
    departments: list[Department] = Relationship(back_populates="wards", link_model=DepartmentWardLink)
    issues: list[Issue] = Relationship(back_populates="ward")
