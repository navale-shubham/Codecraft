"""
Base model configuration and common model utilities.
"""
import uuid
from sqlmodel import SQLModel


def generate_uuid() -> str:
    return str(uuid.uuid4())


__all__ = ["SQLModel", "generate_uuid"]
