from datetime import datetime, timezone

from sqlmodel import Session

from app.models import User, Issue, IssueStatus
from app.crud import CRUDIssue


class IssueNotFoundError(Exception):
    pass


class ForbiddenError(Exception):
    pass


def is_field_staff(user: User) -> bool:
    return user.role == "FIELD_STAFF" and user.department_id is not None


def apply_for_issue_resolution(session: Session, field_staff: User, issue_id: str):
    issue = session.get(Issue, issue_id)
    if not issue:
        raise IssueNotFoundError()

    if issue.assigned_to_id != field_staff.id:
        raise ForbiddenError()

    issue.status = IssueStatus.RESOLUTION_PENDING

    return CRUDIssue(session).update(issue)
