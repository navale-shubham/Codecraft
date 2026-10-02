import uuid
from typing import TypeVar, Generic

from sqlmodel import SQLModel, Field
from pydantic import BaseModel


def generate_id() -> str:
    return str(uuid.uuid7())


ModelType = TypeVar("ModelType")


class ApiResponse(BaseModel, Generic[ModelType]):
    success: bool = True
    data: ModelType = Field(default=None)


class ApiErrorResponse(BaseModel):
    success: bool = False
    error_code: str


class Token(BaseModel):
    token_type: str = "bearer"
    access_token: str


class Location(SQLModel):
    latitude: float
    longitude: float
