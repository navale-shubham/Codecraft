"""
Organization SQLModel Model.
"""
from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from .base import generate_uuid

if TYPE_CHECKING:
    from .department import Department
    from .ward import Ward
    from .user import User


class Organization(SQLModel, table=True):
    __tablename__ = "organizations"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    name: str = Field(max_length=150)
    code: str = Field(max_length=50, unique=True)
    description: str | None = None
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str = Field(default="India", max_length=100)
    status: str = Field(default="ACTIVE", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    departments: list[Department] = Relationship(back_populates="organization")
    wards: list[Ward] = Relationship(back_populates="organization")
    users: list[User] = Relationship(back_populates="organization")
