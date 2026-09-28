"""
Department SQLModel Model.
"""
from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from .base import generate_uuid
from .associations import DepartmentWardLink, CategoryDepartmentLink

if TYPE_CHECKING:
    from .organization import Organization
    from .ward import Ward
    from .category import IssueCategory
    from .issue import Issue


class Department(SQLModel, table=True):
    __tablename__ = "departments"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    name: str = Field(max_length=150)
    code: str = Field(max_length=50)
    description: str | None = None
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    status: str = Field(default="ACTIVE", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    organization: Organization | None = Relationship(back_populates="departments")
    wards: list[Ward] = Relationship(back_populates="departments", link_model=DepartmentWardLink)
    categories: list[IssueCategory] = Relationship(back_populates="departments", link_model=CategoryDepartmentLink)
    issues: list[Issue] = Relationship(back_populates="department")
