import uuid

from sqlmodel import SQLModel, Field


def generate_id() -> str:
    return str(uuid.uuid7())


class ApiResponse(SQLModel):
    success: bool = True
    data: dict | list = Field(default={})

class ApiErrorResponse(SQLModel):
    success: bool = False
    error_code: str
