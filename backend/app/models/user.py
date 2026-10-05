from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue
    from .organization import Organization


from enum import Enum
from datetime import datetime, timezone

from sqlalchemy import ForeignKey
from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr

from .base import generate_id


class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    ORG_ADMIN = "ORG_ADMIN"
    DEPARTMENT_STAFF = "DEPARTMENT_STAFF"
    FIELD_STAFF = "FIELD_STAFF"


class User(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "users"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    department_id: str | None = Field(
        default=None, 
        sa_column_args=[ForeignKey("departments.id", name="fk_users_department_id")], 
        max_length=36
    )
    name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    password_hash: str
    role: UserRole

    created_issues: Optional[list[Issue]] = Relationship(
        back_populates="citizen",
        sa_relationship_kwargs={ "foreign_keys": "[Issue.citizen_id]" }
    )
    assigned_issues: Optional[list[Issue]] = Relationship(
        back_populates="assigned_to",
        sa_relationship_kwargs={ "foreign_keys": "[Issue.assigned_to_id]" }
    )
    organization: Organization = Relationship(
        back_populates="admin",
        sa_relationship_kwargs={ "foreign_keys": "[Organization.admin_id]" }
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(SQLModel):
    organization_id: str | None = Field(default=None, max_length=36)
    department_id: str | None = Field(default=None, max_length=36)
    name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    password: str


class UserLogin(SQLModel):
    email: EmailStr
    password: str


class UserResponse(SQLModel):
    id: str
    name: str
    email: str
    role: UserRole


class UserViewResponse(SQLModel):
    name: str