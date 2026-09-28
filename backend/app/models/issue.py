"""
Issue and Issue-related SQLModel Models.
Includes: Issue, IssueMedia, IssueAssignment, IssueStatusHistory, IssueComment, IssueResolution, IssueReopen.
"""

from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from .base import generate_uuid


class Issue(SQLModel, table=True):
    __tablename__ = "issues"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_number: str = Field(max_length=30, unique=True)
    citizen_id: str = Field(foreign_key="users.id", max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    category_id: str = Field(foreign_key="issue_categories.id", max_length=36)
    ward_id: str = Field(foreign_key="wards.id", max_length=36)

    title: str = Field(max_length=255)
    description: str

    # GPS location data
    latitude: float | None = None
    longitude: float | None = None
    location_accuracy: float | None = Field(default=None, description="GPS accuracy in meters")
    location_captured_at: datetime | None = Field(default=None, description="When the GPS fix was taken")
    address: str

    priority: str = Field(default="MEDIUM", max_length=20)
    # LOW, MEDIUM, HIGH, CRITICAL
    status: str = Field(default="REPORTED", max_length=30)
    # REPORTED, UNDER_REVIEW, REJECTED, ASSIGNED, IN_PROGRESS, RESOLUTION_PENDING, RESOLVED, CLOSED, REOPENED, ESCALATED

    # Auto-classification metadata
    auto_classified: bool = Field(default=False, description="Whether category/ward were auto-determined")
    classification_confidence: float | None = Field(default=None, description="AI classification confidence 0-1")

    assigned_to: str | None = Field(default=None, foreign_key="users.id", max_length=36)

    reported_at: datetime = Field(default_factory=datetime.utcnow)
    due_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    department: Department | None = Relationship(
        back_populates="issues",
        sa_relationship_kwargs={"foreign_keys": "[Issue.department_id]"}
    )
    ward: Ward | None = Relationship(
        back_populates="issues",
        sa_relationship_kwargs={"foreign_keys": "[Issue.ward_id]"}
    )
    media: list[IssueMedia] = Relationship(back_populates="issue")
    comments: list[IssueComment] = Relationship(back_populates="issue")
    history: list[IssueStatusHistory] = Relationship(back_populates="issue")
    assignments: list[IssueAssignment] = Relationship(back_populates="issue")
    resolution: IssueResolution | None = Relationship(
        back_populates="issue",
        sa_relationship_kwargs={"uselist": False}
    )
    reopens: list[IssueReopen] = Relationship(back_populates="issue")


class IssueMedia(SQLModel, table=True):
    __tablename__ = "issue_media"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    uploaded_by: str = Field(foreign_key="users.id", max_length=36)
    media_type: str = Field(default="IMAGE", max_length=20)
    # IMAGE, VIDEO, DOCUMENT
    file_url: str
    thumbnail_url: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    issue: Issue | None = Relationship(back_populates="media")


class IssueAssignment(SQLModel, table=True):
    __tablename__ = "issue_assignments"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    assigned_to: str = Field(foreign_key="users.id", max_length=36)
    assigned_by: str = Field(foreign_key="users.id", max_length=36)
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    unassigned_at: datetime | None = None
    reason: str | None = None

    issue: Issue | None = Relationship(back_populates="assignments")


class IssueStatusHistory(SQLModel, table=True):
    __tablename__ = "issue_status_history"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    old_status: str | None = Field(default=None, max_length=30)
    new_status: str = Field(max_length=30)
    changed_by: str = Field(foreign_key="users.id", max_length=36)
    reason: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    issue: Issue | None = Relationship(back_populates="history")


class IssueComment(SQLModel, table=True):
    __tablename__ = "issue_comments"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    user_id: str = Field(foreign_key="users.id", max_length=36)
    comment: str
    is_internal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    issue: Issue | None = Relationship(back_populates="comments")


class IssueResolution(SQLModel, table=True):
    __tablename__ = "issue_resolutions"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    resolved_by: str = Field(foreign_key="users.id", max_length=36)
    resolution_description: str
    resolution_type: str = Field(default="REPAIRED", max_length=50)
    # REPAIRED, CLEANED, REPLACED, REMOVED, INSPECTED, NO_ACTION_REQUIRED, DUPLICATE
    evidence_media_id: str | None = Field(default=None, max_length=36)
    evidence_media_url: str | None = None
    resolved_at: datetime = Field(default_factory=datetime.utcnow)
    citizen_verified: bool | None = None
    citizen_verified_at: datetime | None = None

    issue: Issue | None = Relationship(back_populates="resolution")


class IssueReopen(SQLModel, table=True):
    __tablename__ = "issue_reopens"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    reopened_by: str = Field(foreign_key="users.id", max_length=36)
    reason: str
    media_url: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    issue: Issue | None = Relationship(back_populates="reopens")


# Avoid circular imports — import here for relationship resolution
from .department import Department  # noqa: E402, F401
from .ward import Ward  # noqa: E402, F401
