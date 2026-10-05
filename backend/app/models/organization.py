from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue, IssueCategory
    from .department import Department
    from .ward import Ward
    from .user import User


from datetime import datetime, timezone

from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class Organization(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "organizations"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    admin_id: str = Field(
        sa_column_args=[ForeignKey("users.id", name="fk_organizations_admin_id")], 
        max_length=36
    )
    name: str = Field(max_length=150)

    issues: list[Issue] = Relationship(back_populates="organization")
    departments: list[Department] = Relationship(back_populates="organization")
    wards: list[Ward] = Relationship(back_populates="organization")
    categories: list[IssueCategory] = Relationship(back_populates="organization")
    admin: User = Relationship(
        back_populates="organization",
        sa_relationship_kwargs={ "foreign_keys": "[Organization.admin_id]" }
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrganizationCreateRequest(SQLModel):
    name: str
    email: str
    organization_name: str
    password: str

class OrganizationViewResponse(SQLModel):
    name: str


class OrganizationResponse(SQLModel):
    id: str
    name: str
