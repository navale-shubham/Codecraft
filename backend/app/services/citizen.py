from sqlmodel import Session

from app.models import (
    User, UserCreate, Issue, IssueCreateRequest, IssueStatus,
    IssueMedia, IssueMediaCreateRequest, IssueCategoryViewResponse,
    Location, MediaType
)
from app.crud import (
    CRUDUser, CRUDIssue, CRUDIssueMedia, CRUDWard,
    CRUDIssueCategory
)
from app.core import get_password_hash, UserRole

from .utils import generate_issue_number


class IssueNotFoundError(Exception):
    pass

class ForbiddenError(Exception):
    pass

class WardNotFoundError(Exception):
    pass

class IssueCategoryNotFoundError(Exception):
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


def determine_issue_ward(
    session: Session, 
    location: Location
):
    return CRUDWard(session).get_nearest_ward(location)


def create_issue(
    session: Session, 
    payload: IssueCreateRequest, 
    citizen: User
) -> Issue:
    issue_repo = CRUDIssue(session)
    issue_category_repo = CRUDIssueCategory(session)

    ward = determine_issue_ward(session, payload.location)
    if not ward:
        raise WardNotFoundError()
    
    organization = ward.organization
    
    issue_category = issue_category_repo.read(payload.category_id)
    if not issue_category:
        raise IssueCategoryNotFoundError()
    department = issue_category.department

    issue = Issue(
        issue_number=generate_issue_number(),
        citizen_id=citizen.id,
        organization_id=organization.id,
        ward_id=ward.id,
        department_id=department.id,
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
        file_url=payload.file_url,
        type=MediaType.QUERY
    )
    return media_repo.create(media)


def get_issue_categories(session: Session):
    return CRUDIssueCategory(session).read_all()
