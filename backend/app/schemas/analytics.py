"""
Analytics and reporting schemas.
"""
from sqlmodel import SQLModel


class OrganizationAnalyticsResponse(SQLModel):
    totalIssues: int
    openIssues: int
    resolvedIssues: int
    overdueIssues: int
    averageResolutionTimeHours: float
    citizenSatisfactionRate: float


class DepartmentMetric(SQLModel):
    department: str
    total: int
    resolved: int
    open: int


class WardMetric(SQLModel):
    ward: str
    total: int
    resolved: int
    open: int


class CategoryMetric(SQLModel):
    category: str
    total: int
    resolved: int
    open: int
