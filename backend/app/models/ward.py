from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue, IssueResponse
    from .organization import Organization


from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class Ward(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "wards"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    name: str = Field(max_length=100)
    geo_boundary: object = Field(sa_type=Geometry('POLYGON', 4326))

    organization: Organization = Relationship(back_populates="wards")
    issues: list[Issue] = Relationship(back_populates="ward")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WardViewResponse(SQLModel):
    name: str


class WardResponse(SQLModel):
    id: str
    name: str
    geo_boundary: dict
    issues: list[IssueResponse]


class WardCreateRequest(SQLModel):
    name: str
    geo_boundary: dict
