from sqlmodel import Session

from app.models import User
from app.crud import CRUDUser


def read_user_by_id(session: Session, user_id: str) -> User | None:
    return CRUDUser(session).read(user_id)


def read_user_by_email(session: Session, email: str) -> User | None:
    return CRUDUser(session).read_by_email(email)
