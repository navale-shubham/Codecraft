from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue, IssueCategory
    from .organization import Organization


from datetime import datetime, timezone

from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class Department(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "departments"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(
        sa_column_args=[ForeignKey("organizations.id", name="fk_departments_organization_id")], 
        max_length=36
    )
    name: str = Field(max_length=150)

    categories: list[IssueCategory] = Relationship(back_populates="department")
    organization: Organization = Relationship(back_populates="departments")
    issues: list[Issue] = Relationship(back_populates="department")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DepartmentViewResponse(SQLModel):
    name: str


class DepartmentDashboardResponse(SQLModel):
    total_issues: int
    open_issues: int
    in_progress_issues: int
    resolved_issues: int
    overdue_issues: int


class DepartmentCreateRequest(SQLModel):
    name: str


class DepartmentResponse(SQLModel):
    id: str
    name: str
    dashboard: DepartmentDashboardResponse
