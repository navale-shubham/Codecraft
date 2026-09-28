"""
SLAPolicy SQLModel Model.
"""

from datetime import datetime
from sqlmodel import SQLModel, Field
from .base import generate_uuid


class SLAPolicy(SQLModel, table=True):
    __tablename__ = "sla_policies"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str = Field(foreign_key="organizations.id", max_length=36)
    department_id: str | None = Field(default=None, foreign_key="departments.id", max_length=36)
    category_id: str | None = Field(default=None, foreign_key="issue_categories.id", max_length=36)
    priority: str = Field(max_length=20)
    # CRITICAL, HIGH, MEDIUM, LOW
    resolution_hours: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
