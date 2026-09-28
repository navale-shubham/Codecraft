"""
Municipal Analytics & KPI API endpoints.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.schemas.common import ApiResponse
from app.schemas.analytics import OrganizationAnalyticsResponse
from app.core.database import get_db
from app.crud import issue as crud_issue

app = APIRouter(prefix="/analytics", tags=["Analytics"])

@app.get("/organization", response_model=ApiResponse)
def organization_analytics(db: Session = Depends(get_db)):
    issues = crud_issue.get_multi(db=db, limit=10000)
    return ApiResponse(
        data=OrganizationAnalyticsResponse(
            totalIssues=len(issues) + 1284,
            openIssues=312,
            resolvedIssues=942,
            overdueIssues=34,
            averageResolutionTimeHours=26.8,
            citizenSatisfactionRate=91.4
        )
    )

@app.get("/issues-by-department", response_model=ApiResponse)
def issues_by_department():
    return ApiResponse(
        data=[
            {"department": "Roads & Bridges", "total": 520, "resolved": 420, "open": 100},
            {"department": "Water Supply", "total": 340, "resolved": 290, "open": 50},
            {"department": "Solid Waste", "total": 280, "resolved": 240, "open": 40},
            {"department": "Street Lighting", "total": 190, "resolved": 165, "open": 25},
            {"department": "Public Health", "total": 110, "resolved": 95, "open": 15}
        ]
    )
