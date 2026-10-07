from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User, UserViewResponse
    from .organization import Organization, OrganizationViewResponse
    from .ward import Ward, WardViewResponse
    from .department import Department, DepartmentViewResponse


from enum import Enum
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship

from .base import generate_id, Location


class IssueStatus(str, Enum):
    REPORTED = "REPORTED"
    REJECTED = "REJECTED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLUTION_PENDING = "RESOLUTION_PENDING"
    RESOLVED = "RESOLVED"


class MediaType(str, Enum):
    QUERY = 'QUERY'
    RESOLUTION = 'RESOLUTION'


class IssueCategory(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issue_categories"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    name: str = Field(max_length=150)

    issues: list[Issue] = Relationship(back_populates="category")
    organization: Organization = Relationship(back_populates="categories")
    department: Department = Relationship(back_populates="categories")


class Issue(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issues"

    id: str | None = Field(default_factory=generate_id, primary_key=True, max_length=36)
    issue_number: str = Field(max_length=50, unique=True)
    citizen_id: str = Field(foreign_key="users.id", max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    ward_id: str = Field(foreign_key="wards.id", max_length=36)
    department_id: str = Field(foreign_key="departments.id", max_length=36)
    category_id: str = Field(foreign_key="issue_categories.id", max_length=36)

    title: str = Field(max_length=255)
    description: str

    latitude: float
    longitude: float

    status: IssueStatus = Field(default=IssueStatus.REPORTED, max_length=30)

    assigned_to_id: str | None = Field(default=None, foreign_key="users.id", max_length=36)

    reported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    citizen: User = Relationship(
        back_populates="created_issues",
        sa_relationship_kwargs={ "foreign_keys": "[Issue.citizen_id]" }
    )
    assigned_to: Optional[User] = Relationship(
        back_populates="assigned_issues",
        sa_relationship_kwargs={ "foreign_keys": "[Issue.assigned_to_id]" }
    )
    organization: Organization = Relationship(back_populates="issues")
    ward: Ward = Relationship(back_populates="issues")
    department: Department = Relationship(back_populates="issues")
    category: IssueCategory = Relationship(back_populates="issues")
    media: list[IssueMedia] = Relationship(back_populates="issue")


class IssueMedia(SQLModel, table=True):
    # pyrefly: ignore[bad-override]
    __tablename__ = "issue_media"

    id: str = Field(default_factory=generate_id, primary_key=True, max_length=36)
    issue_id: str = Field(foreign_key="issues.id", max_length=36)
    file_url: str
    type: MediaType

    issue: Issue = Relationship(back_populates="media")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IssueCreateRequest(SQLModel):
    title: str
    description: str
    category_id: str
    location: Location


class IssueCreateResponse(SQLModel):
    id: str | None


class IssueCategoryViewResponse(SQLModel):
    id: str
    name: str


class IssueMediaCreateRequest(SQLModel):
    issue_id: str
    file_url: str
    type: MediaType | None = None


class IssueResponse(SQLModel):
    id: str
    issue_number: str
    citizen: UserViewResponse
    organization: OrganizationViewResponse
    ward: WardViewResponse
    department: DepartmentViewResponse
    category: IssueCategoryViewResponse

    title: str
    description: str

    latitude: float
    longitude: float

    status: IssueStatus

    assigned_to: UserViewResponse | None

    reported_at: datetime
    due_at: datetime | None
    resolved_at: datetime | None

    created_at: datetime

    media: list[IssueMediaResponse]


class IssueMediaResponse(SQLModel):
    file_url: str
    type: MediaType


class IssueAssignementRequest(SQLModel):
    issue_id: str
    assigned_to_id: str
    due_at: datetime


class IssueCategoryCreateRequest(SQLModel):
    name: str
    department_id: str
