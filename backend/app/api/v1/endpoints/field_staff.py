from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core import get_session, HTTPException
from app.models import ApiResponse, IssueResponse, User, UserRole
from app.services import (
    is_field_staff, apply_for_issue_resolution,
    IssueNotFoundError, ForbiddenError
)

from .auth import get_current_user


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
