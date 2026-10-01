from enum import Enum
from datetime import datetime, timezone

from sqlmodel import SQLModel, Field
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
    organization_id: str | None = Field(default=None, foreign_key="organizations.id", max_length=36)
    department_id: str | None = Field(default=None, foreign_key="departments.id", max_length=36)
    name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    password_hash: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(SQLModel):
    organization_id: str | None = Field(default=None, max_length=36)
    department_id: str | None = Field(default=None, max_length=36)
    name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True)
    password: str
    role: UserRole


class UserLogin(SQLModel):
    email: EmailStr
    password: str
