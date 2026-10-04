from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core import HTTPException, get_session
from app.models import (
    User, ApiResponse, ApiErrorResponse,
    Department, DepartmentDashboardResponse, UserCreate,
    UserResponse, IssueResponse, Issue,
    IssueAssignementRequest
)
from app.services import (
    is_department_staff, get_department_by_id,
    get_department_dashboard_analytics,
    create_field_staff, get_field_staff,
    get_department_issues,
    get_issue_by_id, assign_issue_to_staff,
    FieldStaffNotFoundError, FieldStaffDepartmentMismatchError,
    resolve_issue
)

from .auth import get_current_user


app = APIRouter(
    prefix="/departments",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ApiErrorResponse
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ApiErrorResponse
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ApiErrorResponse
        }
    }
)


def require_department_staff(user: Annotated[User, Depends(get_current_user)]):
    if not is_department_staff(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, error_code="FORBIDDEN")

    return user


def require_department(staff: Annotated[User, Depends(require_department_staff)], session: Annotated[Session, Depends(get_session)]):
    # pyrefly: ignore [bad-argument-type]
    department = get_department_by_id(session, staff.department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, error_code="DEPARTMENT_NOT_FOUND")

    return department


def require_issue(
    issue_id: str,
    session: Annotated[Session, Depends(get_session)],
    department: Annotated[Department, Depends(require_department)]
):
    issue = get_issue_by_id(session, issue_id)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, error_code="ISSUE_NOT_FOUND")
    
    if issue.department_id != department.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, error_code="FORBIDDEN")

    return issue


@app.get(
    "/dashboard",
    response_model=ApiResponse[DepartmentDashboardResponse],
    status_code=status.HTTP_200_OK
)
def department_dashboard(
    department: Annotated[Department, Depends(require_department)],
    session: Annotated[Session, Depends(get_session)]
):
    analytics = get_department_dashboard_analytics(session, department)
    return ApiResponse[DepartmentDashboardResponse](data=analytics)


@app.post(
    "/fieldstaff",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED
)
def field_staff(
    department: Annotated[Department, Depends(require_department)],
    session: Annotated[Session, Depends(get_session)],
    payload: UserCreate
):
    try:
        create_field_staff(session, payload, department)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )


@app.get(
    "/fieldstaff",
    response_model=ApiResponse[list[UserResponse]],
    status_code=status.HTTP_200_OK
)
def field_staff(
    department: Annotated[Department, Depends(require_department)],
    session: Annotated[Session, Depends(get_session)],
):
    try:
        users = get_field_staff(session, department.id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )

    return ApiResponse[list[UserResponse]](data=users)


@app.get(
    "/issues",
    response_model=ApiResponse[list[IssueResponse]]
)
def department_issues(
    department: Annotated[Department, Depends(require_department)],
    session: Annotated[Session, Depends(get_session)]
):
    try:
        issues = get_department_issues(session, department.id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )

    return ApiResponse[list[IssueResponse]](data=issues)


@app.post(
    "/issues/assign",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED
)
def assign_issue(
    payload: IssueAssignementRequest,
    issue: Annotated[Issue, Depends(require_issue)],
    staff: Annotated[User, Depends(require_department_staff)],
    session: Annotated[Session, Depends(get_session)],
):
    try:
        assign_issue_to_staff(session, staff, issue, payload)
    except FieldStaffNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="FIELD_STAFF_NOT_FOUND"
        )
    except FieldStaffDepartmentMismatchError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="FIELD_STAFF_DEPARTMENT_MISMATCH"
        )


@app.post(
    "/issues/resolve",
    response_model=ApiResponse[None],
    status_code=status.HTTP_200_OK
)
def issue_resolution(
    issue: Annotated[Issue, Depends(require_issue)],
    session: Annotated[Session, Depends(get_session)],
):
    try:
        resolve_issue(session, issue)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )
