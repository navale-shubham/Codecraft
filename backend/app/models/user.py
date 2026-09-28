"""
User SQLModel Model.
"""
from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from .base import generate_uuid

if TYPE_CHECKING:
    from .organization import Organization


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str | None = Field(default=None, foreign_key="organizations.id", max_length=36)
    department_id: str | None = Field(default=None, foreign_key="departments.id", max_length=36)
    ward_id: str | None = Field(default=None, foreign_key="wards.id", max_length=36)
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    phone: str | None = Field(default=None, max_length=30, unique=True)
    password_hash: str
    role: str = Field(default="CITIZEN", max_length=50)
    # CITIZEN, DEPT_ADMIN, SUPERVISOR, FIELD_STAFF, ORG_ADMIN
    status: str = Field(default="ACTIVE", max_length=20)
    last_login_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    organization: Organization | None = Relationship(back_populates="users")
