from datetime import datetime, timezone

from sqlmodel import Session

from app.models import (
    User, Issue, IssueStatus, IssueMediaCreateRequest,
    MediaType, IssueMedia
)
from app.crud import CRUDIssue, CRUDIssueMedia


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


def save_issue_resolve_media(
    session,
    payload: IssueMediaCreateRequest
):
    media_repo = CRUDIssueMedia(session)

    media = IssueMedia(
        issue_id=payload.issue_id,
        file_url=payload.file_url,
        type=MediaType.RESOLUTION
    )
    return media_repo.create(media)
