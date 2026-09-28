"""
Common API response and error schemas.
"""
from typing import Any
from sqlmodel import SQLModel


class ApiResponse(SQLModel):
    success: bool = True
    data: Any | None = None
    message: str | None = "Operation successful"


class ApiError(SQLModel):
    code: str
    message: str


class ApiErrorResponse(SQLModel):
    success: bool = False
    error: ApiError
