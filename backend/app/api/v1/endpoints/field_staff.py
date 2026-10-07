from typing import Annotated
from pathlib import Path
import shutil

from fastapi import APIRouter, Depends, status, File, UploadFile
from sqlmodel import Session

from app.core import get_session, HTTPException
from app.models import (
    ApiResponse, IssueResponse, User, IssueMediaCreateRequest
)
from app.services import (
    is_field_staff, apply_for_issue_resolution,
    IssueNotFoundError, ForbiddenError,
    save_issue_resolve_media
)
from app.core import settings, generate_file_name

from .auth import get_current_user


MEDIA_PATH = settings.MEDIA_PATH
MAX_FILE_SIZE = settings.MAX_FILE_SIZE
ALLOWED_FILE_TYPES = settings.ALLOWED_FILE_TYPES
MEDIA_URL = settings.MEDIA_URL


app = APIRouter(
    prefix="/field-staff",
)


def require_field_staff(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if not is_field_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN"
        )

    return current_user


@app.get(
    '/issues',
    response_model=ApiResponse[list[IssueResponse]],
    status_code=status.HTTP_200_OK
)
def get_issues(
    field_staff: Annotated[User, Depends(require_field_staff)]
):
    return ApiResponse[list[IssueResponse]](
        data=field_staff.assigned_issues
    )


@app.post(
    "/issues/{issue_id}/resolve",
    response_model=ApiResponse[IssueResponse],
    status_code=status.HTTP_200_OK
)
def issue_resolution(
    field_staff: Annotated[User, Depends(require_field_staff)],
    issue_id: str,
    session: Annotated[Session, Depends(get_session)]
):
    try:
        issue = apply_for_issue_resolution(session, field_staff, issue_id)
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
    
    return ApiResponse[IssueResponse](data=issue)


@app.post(
    "/issues/{issue_id}/resolve/media",
    status_code=status.HTTP_201_CREATED
)
def issue_resolution_media(
    field_staff: Annotated[User, Depends(require_field_staff)],
    issue_id: str,
    session: Annotated[Session, Depends(get_session)],
    file: UploadFile = File(...)
):
    if not file.content_type in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_TYPE"
        )
    
    # pyrefly: ignore [unsupported-operation]
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="FILE_TOO_LARGE"
        )
    
    file_path = MEDIA_PATH / issue_id
    file_path.mkdir(parents=True, exist_ok=True)

    file_name = generate_file_name()

    # pyrefly: ignore [bad-argument-type]
    file_extension = Path(file.filename).suffix
    file_path = file_path / f"{file_name}{file_extension}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    save_issue_resolve_media(
        session,
        IssueMediaCreateRequest(
            # pyrefly: ignore [bad-argument-type]
            issue_id=issue_id,
            file_url=f'{MEDIA_URL}/{issue_id}/{file_path.name}'
        )
    )

    return ApiResponse[None]()
