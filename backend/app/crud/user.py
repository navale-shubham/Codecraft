from sqlmodel import select

from app.models import User, UserRole

from .base import CRUDBase


class CRUDUser(CRUDBase[User]):
    MODEL: type[User] = User

    def read_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where(User.email == email)).first()
    
    def read_by_department_id(self, department_id: str, role: UserRole):
        return self.session.exec(select(User).where(
            User.department_id == department_id,
            User.role == role
        )).all()
