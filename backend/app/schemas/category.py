"""
Issue category schemas.
"""

from sqlmodel import SQLModel


class CategoryCreateRequest(SQLModel):
    name: str
    parentId: str | None = None
    description: str | None = None
    icon: str | None = None
    departmentId: str | None = None


class CategoryResponse(SQLModel):
    id: str
    name: str
    parentId: str | None = None
    description: str | None = None
    icon: str | None = None
    departmentId: str | None = None
    departmentName: str | None = None
    status: str = "ACTIVE"
