"""
SQLModel Schemas for Request & Response serialization.
Exports all schemas from the modular schemas package.
"""
from .common import (
    ApiResponse,
    ApiError,
    ApiErrorResponse,
)
from .auth import (
    CitizenRegisterRequest,
    LoginRequest,
    UserResponse,
    LoginData,
)
from .issue import (
    GPSLocation,
    IssueMediaResponse,
    CommentCreateRequest,
    CommentResponse,
    IssueCreateRequest,
    AssignIssueRequest,
    UpdateStatusRequest,
    UpdatePriorityRequest,
    ResolveIssueRequest,
    VerifyResolutionRequest,
    ReopenIssueRequest,
    IssueTimelineItem,
    IssueResponse,
)
from .department import (
    DepartmentCreateRequest,
    DepartmentResponse,
    DepartmentDashboardResponse,
)
from .ward import (
    WardCreateRequest,
    WardResponse,
)
from .category import (
    CategoryCreateRequest,
    CategoryResponse,
)
from .analytics import (
    OrganizationAnalyticsResponse,
    DepartmentMetric,
    WardMetric,
    CategoryMetric,
)
from .notification import (
    NotificationResponse,
)

__all__ = [
    "ApiResponse",
    "ApiError",
    "ApiErrorResponse",
    "CitizenRegisterRequest",
    "LoginRequest",
    "UserResponse",
    "LoginData",
    "GPSLocation",
    "IssueMediaResponse",
    "CommentCreateRequest",
    "CommentResponse",
    "IssueCreateRequest",
    "AssignIssueRequest",
    "UpdateStatusRequest",
    "UpdatePriorityRequest",
    "ResolveIssueRequest",
    "VerifyResolutionRequest",
    "ReopenIssueRequest",
    "IssueTimelineItem",
    "IssueResponse",
    "DepartmentCreateRequest",
    "DepartmentResponse",
    "DepartmentDashboardResponse",
    "WardCreateRequest",
    "WardResponse",
    "CategoryCreateRequest",
    "CategoryResponse",
    "OrganizationAnalyticsResponse",
    "DepartmentMetric",
    "WardMetric",
    "CategoryMetric",
    "NotificationResponse",
]
