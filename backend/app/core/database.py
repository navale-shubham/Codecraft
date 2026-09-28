"""
Database Engine & Session Management for CivicPulse FastAPI backend.
Uses SQLModel for unified ORM + Pydantic schema management.
Supports PostgreSQL (default) and SQLite fallback for local developer testing.
"""
from sqlmodel import SQLModel, Session, create_engine
from .config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def create_db_and_tables():
    """Create all SQLModel tables."""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Yield a database session for dependency injection."""
    with Session(engine) as session:
        yield session
