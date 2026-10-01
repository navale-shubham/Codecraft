from datetime import datetime, timezone

from sqlmodel import SQLModel, Field

from .base import generate_id


class Organization(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "organizations"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    name: str = Field(max_length=150)
    email: str = Field(max_length=255, unique=True)
    password_hash: str = Field(max_length=255)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
