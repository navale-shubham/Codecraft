"""
AuditLog SQLModel Model.
"""
from typing import Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from .base import generate_uuid


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    organization_id: str | None = Field(default=None, foreign_key="organizations.id", max_length=36)
    user_id: str | None = Field(default=None, foreign_key="users.id", max_length=36)
    user_name: str | None = Field(default=None, max_length=100)
    action: str = Field(max_length=100)
    entity_type: str = Field(max_length=50)
    entity_id: str | None = Field(default=None, max_length=36)
    details: Any | None = Field(default=None, sa_column=Column(JSON))
    ip_address: str | None = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
