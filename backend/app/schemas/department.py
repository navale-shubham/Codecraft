"""
Department schemas.
"""

from sqlmodel import SQLModel


class DepartmentCreateRequest(SQLModel):
    name: str
    code: str
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    wardIds: list[str] | None = []
    categoryIds: list[str] | None = []


class DepartmentResponse(SQLModel):
    id: str
    name: str
    code: str
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    status: str = "ACTIVE"
    wardIds: list[str] | None = []
    categoryIds: list[str] | None = []


class DepartmentDashboardResponse(SQLModel):
    totalIssues: int
    openIssues: int
    inProgress: int
    resolved: int
    overdue: int
    averageResolutionHours: float
