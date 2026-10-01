from sqlmodel import Session, select

from app.models import User

from .base import CRUDBase


class CRUDUser(CRUDBase[User]):
    MODEL: type[User] = User

    def read_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where(User.email == email)).first()
