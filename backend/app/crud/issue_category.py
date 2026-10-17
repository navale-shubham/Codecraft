from sqlmodel import select

from app.models import IssueCategory

from .base import CRUDBase

class CRUDIssueCategory(CRUDBase[IssueCategory]):
    MODEL: type[IssueCategory] = IssueCategory

    def read_by_organization(self, organization_id: str):
        return self.session.exec(select(self.MODEL).where(self.MODEL.organization_id == organization_id)).all()

    def read_by_name(self, name: str):
        return self.session.exec(select(self.MODEL).where(self.MODEL.name == name)).first()
