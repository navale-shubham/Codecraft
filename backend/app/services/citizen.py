from io import BytesIO

from fastapi import UploadFile
from sqlmodel import Session

from app.models import (
    User, UserCreate, Issue, IssueCreateRequest, IssueStatus,
    IssueMedia, IssueMediaCreateRequest, IssueCategoryViewResponse,
    Location, MediaType, IssueCategory
)
from app.crud import (
    CRUDUser, CRUDIssue, CRUDIssueMedia, CRUDWard,
    CRUDIssueCategory
)
from app.core import get_password_hash, UserRole, classify_images

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
    latitude: float,
    longitude: float
):
    return CRUDWard(session).get_nearest_ward(Location(latitude=latitude, longitude=longitude))


def determine_issue_category(
    session: Session,
    files: list[UploadFile],
    organization_id: str
):
    category_repo = CRUDIssueCategory(session)

    categories = category_repo.read_by_organization(organization_id)
    if not categories:
        raise IssueCategoryNotFoundError()

    images = [(BytesIO(file.file.read()), file.content_type) for file in files]
    category_names = [category.name for category in categories]

    # pyrefly: ignore[bad-argument-type]
    category_name = classify_images(images, category_names)
    if not category_name:
        raise IssueCategoryNotFoundError()
    
    issue_category = category_repo.read_by_name(category_name)
    if not issue_category:
        raise IssueCategoryNotFoundError()

    return issue_category


def create_issue(
    session: Session, 
    payload: IssueCreateRequest, 
    citizen: User,
    files: list[UploadFile]
) -> Issue:
    issue_repo = CRUDIssue(session)

    ward = determine_issue_ward(session, payload.latitude, payload.longitude)
    if not ward:
        raise WardNotFoundError()
    
    organization = ward.organization
    issue_category = determine_issue_category(session, files, organization.id)
    department = issue_category.department

    issue = Issue(
        issue_number=generate_issue_number(),
        citizen_id=citizen.id,
        organization_id=organization.id,
        ward_id=ward.id,
        department_id=department.id,
        category_id=issue_category.id,
        title=payload.title,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
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
