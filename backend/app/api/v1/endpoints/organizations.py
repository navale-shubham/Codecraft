from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.models import (
    Organization, ApiResponse, ApiErrorResponse,
    User, OrganizationResponse, DepartmentCreateRequest,
    DepartmentDashboardResponse, WardCreateRequest,
    WardResponse, IssueCategoryCreateRequest,
    DepartmentResponse
)
from app.services import (
    is_organization_admin,
    get_organization_by_id,
    create_department, create_ward,
    create_issue_category,
    ForbiddenError,
    get_department_dashboard_analytics
)
from app.core import HTTPException, get_session
from .auth import get_current_user


app = APIRouter(prefix="/organizations")


def require_organization_admin(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not is_organization_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN"
        )

    return current_user


def require_organization(
    admin: Annotated[User, Depends(require_organization_admin)],
    session: Annotated[Session, Depends(get_session)]
):
    try:
        organization = get_organization_by_id(session, admin.id)
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ORGANIZATION_NOT_FOUND"
        )

    return organization


@app.get("/dashboard")
def get_organization_dashboard(
    organization: Annotated[Organization, Depends(require_organization)]
):
    return ApiResponse[OrganizationResponse](data=organization)


@app.post("/departments",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED
)
def department_creation(
    organization: Annotated[Organization, Depends(require_organization)],
    session: Annotated[Session, Depends(get_session)],
    payload: DepartmentCreateRequest
):
    try:
        create_department(session, organization, payload)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )
    
    return ApiResponse[None]()


@app.get(
    "/departments",
    response_model=ApiResponse[list[DepartmentResponse]]
)
def get_departments(
    organization: Annotated[Organization, Depends(require_organization)],
    session: Annotated[Session, Depends(get_session)]
):
    data = []
    for department in organization.departments:
        data.append(
            DepartmentResponse(
                id=department.id,
                name=department.name,
                dashboard=get_department_dashboard_analytics(session, department)
            )
        )
    return ApiResponse[list[DepartmentResponse]](data=data)


@app.post(
    "/wards",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED
)
def ward_creation(
    organization: Annotated[Organization, Depends(require_organization)],
    session: Annotated[Session, Depends(get_session)],
    payload: WardCreateRequest
):
    try:
        create_ward(session, organization, payload)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )


@app.get(
    "/wards",
    response_model=ApiResponse[list[WardResponse]]
)
def get_wards(
    organization: Annotated[Organization, Depends(require_organization)]
):
    return ApiResponse[list[WardResponse]](data=organization.wards)


@app.post(
    "/categories",
    response_model=ApiResponse[None]
)
def category_creation(
    organization: Annotated[Organization, Depends(require_organization)],
    session: Annotated[Session, Depends(get_session)],
    payload: IssueCategoryCreateRequest
):
    try:
        create_issue_category(session, organization, payload)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="INTERNAL_SERVER_ERROR"
        )
