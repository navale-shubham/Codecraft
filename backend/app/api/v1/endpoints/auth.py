from typing import Annotated

from fastapi import APIRouter, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session

from app.models import (
    ApiResponse, ApiErrorResponse, UserCreate, UserLogin, UserRole,
    Token, OrganizationCreateRequest
)
from app.core import (
    HTTPException, create_access_token, get_session, decode_token,
    verify_password
)
from app.services import (
    read_user_by_id, read_user_by_email, create_citizen,
    create_organization
)


app = APIRouter(prefix="/auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    session: Annotated[Session, Depends(get_session)],
    token: Annotated[str, Depends(oauth2_scheme)]
):
    sub = decode_token(token)
    if not sub or not (user := read_user_by_id(session, user_id=sub)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, error_code="INVALID_TOKEN")
    
    return user


@app.post(
    '/citizen/register',
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": ApiErrorResponse
        },
        status.HTTP_409_CONFLICT: {
            "model": ApiErrorResponse
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ApiErrorResponse
        },
    }
)
def register_citizen(
    payload: UserCreate,
    session: Annotated[Session, Depends(get_session)]
):
    if read_user_by_email(session, email=payload.email):
        raise HTTPException(status_code=409, error_code="USER_ALREADY_EXISTS")

    create_citizen(session, payload)

    return ApiResponse[None]()


@app.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ApiErrorResponse
        }
    }
)
def login(
    payload: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)]
):
    user = read_user_by_email(session, email=payload.username)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, error_code="INVALID_CREDENTIALS")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, error_code="INVALID_CREDENTIALS")
    
    return Token(
        token_type="bearer",
        access_token=create_access_token(user.id)
    )


@app.post(
    "/organization/register",
    response_model=ApiResponse[None],
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": ApiErrorResponse
        },
        status.HTTP_409_CONFLICT: {
            "model": ApiErrorResponse
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ApiErrorResponse
        },
    }
)
def register_organization(
    payload: OrganizationCreateRequest,
    session: Annotated[Session, Depends(get_session)]
):
    if read_user_by_email(session, email=payload.email):
        raise HTTPException(status_code=409, error_code="ORGANIZATION_ALREADY_EXISTS_FOR_THIS_USER")
    
    create_organization(session, payload)

    return ApiResponse[None]()
