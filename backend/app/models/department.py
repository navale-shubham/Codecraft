from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue


from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class Department(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "departments"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    name: str = Field(max_length=150)

    issues: list[Issue] = Relationship(back_populates="department")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DepartmentViewResponse(SQLModel):
    name: str
