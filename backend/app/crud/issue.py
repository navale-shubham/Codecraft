from sqlmodel import select, Sequence

from app.models import Issue

from .base import CRUDBase


class CRUDIssue(CRUDBase[Issue]):
    MODEL: type[Issue] = Issue

    def get_by_citizen(self, citizen_id: str) -> Sequence[Issue]:
        statement = (
            select(Issue)
            .where(Issue.citizen_id == citizen_id)
        )

        return self.session.exec(statement).all()
