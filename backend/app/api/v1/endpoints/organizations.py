from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.models import (
    Organization, ApiResponse, ApiErrorResponse,
    User, OrganizationResponse, DepartmentCreateRequest,
    DepartmentDashboardResponse, WardCreateRequest,
    WardResponse, IssueCategoryCreateRequest,
    DepartmentResponse, UserCreate, UserResponse,
    IssueCategoryViewResponse, IssueCategoryViewResponse
)
from app.services import (
    is_organization_admin,
    get_organization_by_id,
    create_department, create_ward,
    create_issue_category,
    ForbiddenError,
    get_department_dashboard_analytics,
    create_department_staff,
    get_department_staff
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
    create_ward(session, organization, payload)
    return ApiResponse[None]()


@app.get(
    "/wards",
    response_model=ApiResponse[list[WardResponse]]
)
def get_wards(
    organization: Annotated[Organization, Depends(require_organization)]
):
    return ApiResponse[list[WardResponse]](
        data=[
            WardResponse(
                id=ward.id,
                name=ward.name,
                geo_boundary=ward.geo_boundary_str,
                issues=ward.issues
            )
            for ward in organization.wards
        ]
    )


@app.post(
    "/categories",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED
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
    
    return ApiResponse[None]()


@app.get(
    "/categories",
    response_model=ApiResponse[list[IssueCategoryViewResponse]]
)
def get_categories(
    organization: Annotated[Organization, Depends(require_organization)]
):
    return ApiResponse[list[IssueCategoryViewResponse]](data=organization.categories)


@app.post(
    "/departments/staff",
    status_code=status.HTTP_201_CREATED
)
def department_staff_creation(
    admin: Annotated[User, Depends(require_organization_admin)],
    session: Annotated[Session, Depends(get_session)],
    payload: UserCreate
):
    try:
        create_department_staff(session, admin.organization, payload)
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="DEPARTMENT_NOT_FOUND"
        )
    
    return ApiResponse[None]()


@app.get(
    "/departments/staff",
    response_model=ApiResponse[list[UserResponse]]
)
def department_staff(
    admin: Annotated[User, Depends(require_organization_admin)],
    session: Annotated[Session, Depends(get_session)],
):
    return ApiResponse(
        data=get_department_staff(session, admin)
    )
