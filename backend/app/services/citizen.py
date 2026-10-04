from sqlmodel import Session

from app.models import (
    User, UserCreate, Issue, IssueCreateRequest, IssueStatus,
    IssueMedia, IssueMediaCreateRequest
)
from app.crud import CRUDUser, CRUDIssue, CRUDIssueMedia
from app.core import get_password_hash, UserRole

from .utils import generate_issue_number


class IssueNotFoundError(Exception):
    pass

class ForbiddenError(Exception):
    pass


def is_citizen(user: User) -> bool:
    return user.role == UserRole.CITIZEN


def create_citizen(session: Session, payload: UserCreate) -> User:
    return CRUDUser(session).create(
        User(
            name=payload.name,
            email=payload.email,
            role=UserRole.CITIZEN,
            password_hash=get_password_hash(payload.password),
        )
    )


def create_issue(
    session: Session, 
    payload: IssueCreateRequest, 
    citizen: User
) -> Issue:
    issue_repo = CRUDIssue(session)

    issue = Issue(
        issue_number=generate_issue_number(),
        citizen_id=citizen.id,
        organization_id="",
        ward_id="10245144-a383-46a3-829a-85e3708ab8ba",
        department_id="10245144-a383-46a3-829a-85e3708ab8ba",
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        latitude=payload.location.latitude,
        longitude=payload.location.longitude,
        status=IssueStatus.REPORTED,
    )

    return issue_repo.create(issue)


def check_issue_owner(issue_id: str, citizen: User, session: Session):
    issue = CRUDIssue(session).read(issue_id)

    if not issue:
        raise IssueNotFoundError()
    
    if issue.citizen_id != citizen.id:
        raise ForbiddenError()
    
    return issue


def get_issues_by_citizen(session: Session, citizen: User) -> list[Issue]:
    return CRUDIssue(session).get_by_citizen(citizen.id)


def save_issue_media(
    session: Session, 
    payload: IssueMediaCreateRequest
) -> IssueMedia:
    media_repo = CRUDIssueMedia(session)

    media = IssueMedia(
        issue_id=payload.issue_id,
        file_url=payload.file_url
    )
    return media_repo.create(media)
