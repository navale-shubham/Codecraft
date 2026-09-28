"""
Authentication and user schemas.
"""

from sqlmodel import SQLModel
from pydantic import EmailStr


class CitizenRegisterRequest(SQLModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str | None = None
    password: str
    wardId: str | None = None
    address: str | None = None


class LoginRequest(SQLModel):
    email: str
    password: str


class UserResponse(SQLModel):
    id: str
    name: str
    email: str
    phone: str | None = None
    role: str
    organizationId: str | None = None
    departmentId: str | None = None
    wardId: str | None = None
    status: str = "ACTIVE"


class LoginData(SQLModel):
    accessToken: str
    refreshToken: str
    user: UserResponse
