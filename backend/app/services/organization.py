from sqlmodel import Session
from sqlalchemy import func
import json


from app.models import (
    User, UserCreate, DepartmentCreateRequest, Organization, Department,
    WardCreateRequest, Ward, IssueCategoryCreateRequest,
    OrganizationCreateRequest, UserRole
)
from app.crud import (
    CRUDUser, CRUDOrganization, CRUDDepartment, CRUDWard,
    CRUDIssueCategory, IssueCategory
)
from app.core import get_password_hash


class ForbiddenError(Exception):
    pass


def is_organization_admin(user: User) -> bool:
    return (
        user.role == UserRole.ORG_ADMIN
        and user.organization is not None
    )


def get_organization_by_id(session: Session, admin_id: str):
    admin = CRUDUser(session).read(admin_id)
    if not admin:
        raise ForbiddenError()

    return admin.organization


def create_department(
    session: Session,
    organization: Organization,
    payload: DepartmentCreateRequest
):
    department = Department(
        organization_id=organization.id,
        name=payload.name,
    )

    return CRUDDepartment(session).create(department)


def create_organization(session: Session, payload: OrganizationCreateRequest):
    organization_admin = CRUDUser(session).create(
        User(
            name=payload.name,
            email=payload.email,
            role=UserRole.ORG_ADMIN,
            password_hash=get_password_hash(payload.password),
        )
    )

    organization = CRUDOrganization(session).create(
        Organization(
            admin_id=organization_admin.id,
            name=payload.organization_name,
        )
    )
    
    CRUDUser(session).update(organization_admin)


def convert_geo_boundary(geo_boundary: dict):
    return func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geo_boundary)), 4326)


def create_ward(
    session: Session,
    organization: Organization,
    payload: WardCreateRequest
):
    return CRUDWard(session).create(
        Ward(
            organization_id=organization.id,
            name=payload.name,
            geo_boundary=convert_geo_boundary(payload.geo_boundary),
        )
    )


def create_issue_category(
    session: Session,
    organization: Organization,
    payload: IssueCategoryCreateRequest
):
    category = IssueCategory(
        organization_id=organization.id,
        name=payload.name,
        department_id=payload.department_id
    )

    return CRUDIssueCategory(session).create(category)


def create_department_staff(
    session: Session,
    organization: Organization,
    payload: UserCreate
):
    if not payload.department_id:
        raise ForbiddenError()

    department = CRUDDepartment(session).read(payload.department_id)
    if department is None:
        raise ForbiddenError()
    if department.organization_id != organization.id:
        raise ForbiddenError()

    CRUDUser(session).create(
        User(
            name=payload.name,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            department_id=department.id,
            organization_id=organization.id,
            role=UserRole.DEPARTMENT_STAFF
        )
    )


def get_department_staff(
    session,
    admin
):
    user_repo = CRUDUser(session)

    departments = admin.organization.departments

    return [
        user
        for department in departments
        for user in user_repo.read_by_department_id(
            department.id,
            UserRole.DEPARTMENT_STAFF
        )
    ]
