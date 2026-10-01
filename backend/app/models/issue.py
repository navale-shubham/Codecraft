from enum import Enum
from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id


class IssueStatus(str, Enum):
    REPORTED = "REPORTED"
    REJECTED = "REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLUTION_PENDING = "RESOLUTION_PENDING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class IssueCategory(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issue_categories"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    name: str = Field(max_length=150)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Issue(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issues"

    id: str | None = Field(default_factory=generate_id, primary_key=True, max_length=36)
    issue_number: str = Field(max_length=30, unique=True)
    citizen_id: str = Field(foreign_key="users.id", max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    ward_id: str = Field(foreign_key="wards.id", max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    category_id: str = Field(foreign_key="issue_categories.id", max_length=36)

    title: str = Field(max_length=255)
    description: str

    latitude: float
    longitude: float

    status: IssueStatus = Field(default=IssueStatus.REPORTED, max_length=30)

    assigned_to: str | None = Field(default=None, foreign_key="users.id", max_length=36)

    reported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    media: list[IssueMedia] = Relationship(back_populates="issue")


class IssueMedia(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issue_media"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    file_url: str
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
