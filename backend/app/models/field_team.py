from datetime import datetime, timezone

from sqlmodel import SQLModel, Field

from .base import generate_id


class FieldTeam(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "field_teams"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    name: str = Field(max_length=100)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
