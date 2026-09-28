"""
Notification schemas.
"""

from datetime import datetime
from sqlmodel import SQLModel


class NotificationResponse(SQLModel):
    id: str
    userId: str
    issueId: str | None = None
    title: str
    message: str
    type: str
    isRead: bool
    createdAt: datetime
