"""
IssueCategory SQLModel Model.
"""
from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from .base import generate_uuid
from .associations import CategoryDepartmentLink

if TYPE_CHECKING:
    from .department import Department


class IssueCategory(SQLModel, table=True):
    __tablename__ = "issue_categories"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    parent_id: str | None = Field(default=None, foreign_key="issue_categories.id", max_length=36)
    name: str = Field(max_length=150)
    description: str | None = None
    icon: str | None = Field(default=None, max_length=100)
    status: str = Field(default="ACTIVE", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    departments: list[Department] = Relationship(back_populates="categories", link_model=CategoryDepartmentLink)
    subcategories: list[IssueCategory] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[IssueCategory.parent_id]"}
    )
