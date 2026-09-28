"""
Notification SQLModel Model.
"""

from datetime import datetime
from sqlmodel import SQLModel, Field
from .base import generate_uuid


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    user_id: str = Field(foreign_key="users.id", max_length=36)
    issue_id: str | None = Field(default=None, foreign_key="issues.id", max_length=36)
    title: str = Field(max_length=255)
    message: str
    type: str = Field(max_length=50)
    # ISSUE_CREATED, ISSUE_ASSIGNED, ISSUE_STATUS_CHANGED, ISSUE_RESOLVED, ISSUE_REOPENED, ISSUE_ESCALATED
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: datetime | None = None
