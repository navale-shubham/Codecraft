from app.crud.base import CRUDBase
from app.models.issue import Issue

class CRUDIssue(CRUDBase[Issue]):
    pass

issue = CRUDIssue(Issue)
