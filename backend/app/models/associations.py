"""
Many-to-Many association tables for departments, wards, and categories.
Uses SQLModel with sa_column for explicit SA Column definitions.
"""
from sqlmodel import SQLModel, Field


class DepartmentWardLink(SQLModel, table=True):
    """Many-to-Many link: department ↔ ward."""
    __tablename__ = "department_wards"

    department_id: str = Field(foreign_key="departments.id", primary_key=True, max_length=36)
    ward_id: str = Field(foreign_key="wards.id", primary_key=True, max_length=36)


class CategoryDepartmentLink(SQLModel, table=True):
    """Many-to-Many link: category ↔ department."""
    __tablename__ = "category_departments"

    category_id: str = Field(foreign_key="issue_categories.id", primary_key=True, max_length=36)
    department_id: str = Field(foreign_key="departments.id", primary_key=True, max_length=36)
