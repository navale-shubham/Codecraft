from datetime import datetime, timezone

from sqlmodel import SQLModel, Field

from .base import generate_id


class Department(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "departments"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    name: str = Field(max_length=150)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
