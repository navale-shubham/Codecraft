from app.crud.base import CRUDBase
from app.models.user import User
from sqlmodel import Session, select

class CRUDUser(CRUDBase[User]):
    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.exec(select(User).where(User.email == email)).first()

user = CRUDUser(User)
