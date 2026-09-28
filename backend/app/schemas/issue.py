"""
Issue, comment, media, and timeline schemas.
Includes GPS location sub-schema for accepting location data as GPS coordinates.
"""

from datetime import datetime
from sqlmodel import SQLModel


class GPSLocation(SQLModel):
    """GPS location data — APIs accept location in this structured format."""
    latitude: float
    longitude: float
    accuracy: float | None = None
    captured_at: datetime | None = None


class IssueMediaResponse(SQLModel):
    id: str
    mediaType: str
    fileUrl: str
    thumbnailUrl: str | None = None
    createdAt: datetime | None = None


class CommentCreateRequest(SQLModel):
    comment: str
    isInternal: bool = False


class CommentResponse(SQLModel):
    id: str
    issueId: str
    userId: str
    userName: str
    userRole: str
    comment: str
    isInternal: bool = False
    createdAt: datetime


class IssueCreateRequest(SQLModel):
    """
    Create an issue.
    - `location`: structured GPS data (latitude, longitude, accuracy, captured_at).
    - `categoryId` and `wardId` are now optional — when omitted, the system
      auto-determines them using image analysis and GPS coordinates.
    """
    title: str
    description: str
    categoryId: str | None = None
    wardId: str | None = None
    location: GPSLocation | None = None
    # Legacy flat fields still accepted for backward compatibility
    latitude: float | None = None
    longitude: float | None = None
    address: str | None = None
    priority: str = "MEDIUM"
    mediaUrls: list[str] | None = []


class AssignIssueRequest(SQLModel):
    assignedTo: str
    dueAt: str | None = None
    reason: str | None = None


class UpdateStatusRequest(SQLModel):
    status: str
    reason: str | None = None


class UpdatePriorityRequest(SQLModel):
    priority: str
    reason: str | None = None


class ResolveIssueRequest(SQLModel):
    resolutionType: str = "REPAIRED"
    description: str
    evidenceMediaIds: list[str] | None = []
    evidenceMediaUrl: str | None = None


class VerifyResolutionRequest(SQLModel):
    resolved: bool
    comment: str | None = None


class ReopenIssueRequest(SQLModel):
    reason: str
    mediaUrls: list[str] | None = []


class IssueTimelineItem(SQLModel):
    oldStatus: str | None = None
    newStatus: str
    changedBy: str
    changedByName: str | None = None
    reason: str | None = None
    createdAt: datetime


class IssueResponse(SQLModel):
    id: str
    issueNumber: str
    title: str
    description: str
    status: str
    priority: str
    categoryId: str
    categoryName: str | None = None
    departmentId: str
    departmentName: str | None = None
    wardId: str
    wardName: str | None = None
    citizenId: str
    citizenName: str | None = None
    assignedTo: str | None = None
    assigneeName: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    locationAccuracy: float | None = None
    locationCapturedAt: datetime | None = None
    address: str | None = None
    reportedAt: datetime
    dueAt: datetime | None = None
    resolvedAt: datetime | None = None
    closedAt: datetime | None = None
    autoClassified: bool = False
    classificationConfidence: float | None = None
    media: list[IssueMediaResponse] | None = []
    comments: list[CommentResponse] | None = []
    timeline: list[IssueTimelineItem] | None = []
    evidenceMediaUrl: str | None = None
    resolutionDescription: str | None = None
    resolutionType: str | None = None
    citizenVerified: bool | None = None
