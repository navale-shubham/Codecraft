from typing import Annotated
from pathlib import Path
import shutil

from fastapi import (
    APIRouter, Depends, status, UploadFile,
    Form, File
)
from sqlmodel import Session

from app.core import HTTPException
from app.models import (
    ApiResponse,
    ApiErrorResponse,
    User,
    UserResponse,
    IssueCreateRequest,
    IssueCreateResponse,
    Issue,
    IssueResponse,
    IssueMediaCreateRequest,
)
from app.services import (
    is_citizen,
    create_issue,
    check_issue_owner,
    get_issues_by_citizen,
    IssueNotFoundError,
    ForbiddenError,
    save_issue_media,
    IssueCategoryNotFoundError,
    WardNotFoundError
)
from app.core import get_session, settings
from app.core.utils import generate_file_name

from .auth import get_current_user


app = APIRouter(prefix="/citizens")

MEDIA_PATH = settings.MEDIA_PATH
MAX_FILE_SIZE = settings.MAX_FILE_SIZE
ALLOWED_FILE_TYPES = settings.ALLOWED_FILE_TYPES
MEDIA_URL = settings.MEDIA_URL


def require_citizen(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not is_citizen(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN"
        )

    return current_user


def require_issue_owner(
    issue_id: str,
    citizen: Annotated[User, Depends(require_citizen)],
    session: Annotated[Session, Depends(get_session)]
):
    try:
        issue = check_issue_owner(issue_id, citizen, session)
    except IssueNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="ISSUE_NOT_FOUND"
        )
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN"
        )

    return issue


@app.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_403_FORBIDDEN: {
            "model": ApiErrorResponse
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        }
    }
)
def get_current_citizen(
    citizen: Annotated[User, Depends(require_citizen)]
):
    return ApiResponse[UserResponse](data=citizen)


@app.post(
    "/issues",
    response_model=ApiResponse[IssueCreateResponse],
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_403_FORBIDDEN: {
            "model": ApiErrorResponse
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        }
    }
)
def post_issue(
    session: Annotated[Session, Depends(get_session)],
    citizen: Annotated[User, Depends(require_citizen)],
    title: Annotated[str, Form()],
    description: Annotated[str, Form()],
    latitude: Annotated[float, Form()],
    longitude: Annotated[float, Form()],
    files: Annotated[list[UploadFile], File()],
):
    payload = IssueCreateRequest(
        title=title,
        description=description,
        latitude=latitude,
        longitude=longitude
    )

    for file in files:
        if not file.content_type in ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="INVALID_FILE_TYPE"
            )
        
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="FILE_TOO_LARGE"
        )
    
    try:
        issue = create_issue(session, payload, citizen, files)

        file_path = MEDIA_PATH / issue.id
        file_path.mkdir(parents=True, exist_ok=True)

        for file in files:
            file_name = generate_file_name()
            # pyrefly: ignore [bad-argument-type]
            file_extension = Path(file.filename).suffix

            with open(f'{file_path / f'{file_name}{file_extension}'}', "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
            save_issue_media(
                session,
                IssueMediaCreateRequest(
                    # pyrefly: ignore [bad-argument-type]
                    issue_id=issue.id,
                    file_url=f'{MEDIA_URL}/{issue.id}/{file_name}{file_extension}'
                )
            )

    except IssueCategoryNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="ISSUE_CATEGORY_NOT_FOUND"
        )
    except WardNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="WARD_NOT_FOUND"
        )

    return ApiResponse[IssueCreateResponse](
        data=IssueCreateResponse(id=issue.id)
    )


@app.get(
    "/issues",
    response_model=ApiResponse[list[IssueResponse]],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_403_FORBIDDEN: {
            "model": ApiErrorResponse
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        }
    }
)
def get_my_issues(
    citizen: Annotated[User, Depends(require_citizen)],
    session: Annotated[Session, Depends(get_session)]
):
    issues = get_issues_by_citizen(session, citizen)

    return ApiResponse[list[IssueResponse]](data=issues)


@app.get(
    "/issues/{issue_id}",
    response_model=ApiResponse[IssueResponse],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ApiErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ApiErrorResponse
        },
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        }
    }
)
def get_my_issue(
    issue: Annotated[Issue, Depends(require_issue_owner)]
):
    return ApiResponse[IssueResponse](data=issue)
