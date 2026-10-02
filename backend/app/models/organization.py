from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .issue import Issue


from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class Organization(SQLModel, table=True):
    # pyrefly: ignore [bad-override]
    __tablename__ = "organizations"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    name: str = Field(max_length=150)
    email: str = Field(max_length=255, unique=True)
    password_hash: str = Field(max_length=255)

    issues: list[Issue] = Relationship(back_populates="organization")

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrganizationViewResponse(SQLModel):
    name: str