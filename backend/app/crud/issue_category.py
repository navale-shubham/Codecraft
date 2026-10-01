from app.models import IssueCategory

from .base import CRUDBase

class CRUDIssueCategory(CRUDBase[IssueCategory]):
    MODEL: type[IssueCategory] = IssueCategory
