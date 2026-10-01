from sqlmodel import Session

from app.models import User, UserCreate
from app.crud import CRUDUser
from app.core import get_password_hash


def create_citizen(session: Session, payload: UserCreate) -> User:
    return CRUDUser(session).create(
        User(
            name=payload.name,
            email=payload.email,
            role=payload.role,
            password_hash=get_password_hash(payload.password),
        )
    )
