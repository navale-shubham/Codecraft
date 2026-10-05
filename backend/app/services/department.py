from datetime import datetime, timezone

from sqlmodel import Session

from app.models import (
    User, UserRole, Department, IssueStatus, UserCreate, Issue,
    IssueAssignementRequest
)
from app.crud import CRUDDepartment, CRUDIssue, CRUDUser
from app.core import get_password_hash


class IssueNotFoundError(Exception):
    pass


class FieldStaffNotFoundError(Exception):
    pass


class FieldStaffDepartmentMismatchError(Exception):
    pass


def is_department_staff(user: User):
    return (
        user.role == UserRole.DEPARTMENT_STAFF
        and user.department_id is not None
    )


def get_department_by_id(session: Session, department_id: str):
    return CRUDDepartment(session).read(department_id)


def get_department_dashboard_analytics(session: Session, department: Department):
    total_issues = CRUDIssue(session).get_by_department(department_id=department.id)

    open_issues = [i for i in total_issues if i.status == IssueStatus.REPORTED]
    in_progress_issues = [i for i in total_issues if i.status in [IssueStatus.IN_PROGRESS, IssueStatus.RESOLUTION_PENDING]]
    resolved_issues = [i for i in total_issues if i.status == IssueStatus.RESOLVED]
    overdue_issues = [i for i in in_progress_issues if i.due_at and i.due_at < datetime.now(timezone.utc)]

    return {
        "total_issues": len(total_issues),
        "open_issues": len(open_issues),
        "in_progress_issues": len(in_progress_issues),
        "resolved_issues": len(resolved_issues),
        "overdue_issues": len(overdue_issues)
    }


def create_field_staff(session: Session, field_staff: UserCreate, department: Department):
    user = User(
        name=field_staff.name,
        email=field_staff.email,
        password_hash=get_password_hash(field_staff.password),
        role=UserRole.FIELD_STAFF,
        department_id=department.id,
    )

    return CRUDUser(session).create(user)


def get_field_staff(session: Session, department_id: str):
    return CRUDUser(session).read_by_department_id(department_id, UserRole.FIELD_STAFF)


def get_department_issues(session: Session, department_id: str):
    return CRUDIssue(session).get_by_department(department_id)


def get_issue_by_id(
    session: Session,
    issue_id: str
):
    return CRUDIssue(session).read(issue_id)


def issue_belongs_to_department(
    issue: Issue,
    department: Department
):
    return issue.department_id == department.id


def assign_issue_to_staff(
    session: Session,
    department_staff: User,
    issue: Issue,
    payload: IssueAssignementRequest
):
    field_staff = CRUDUser(session).read(payload.assigned_to_id)

    if not field_staff:
        raise FieldStaffNotFoundError()

    if field_staff.department_id != department_staff.department_id:
        raise FieldStaffDepartmentMismatchError()

    issue.status = IssueStatus.IN_PROGRESS
    issue.assigned_to_id = field_staff.id
    issue.due_at = payload.due_at

    CRUDIssue(session).update(issue)
    return issue


def resolve_issue(
    session: Session,
    issue: Issue
):
    issue.status = IssueStatus.RESOLVED
    issue.resolved_at = datetime.now(timezone.utc)

    CRUDIssue(session).update(issue)
    return issue