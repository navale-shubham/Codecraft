from app.crud.base import CRUDBase
from app.models.category import IssueCategory

class CRUDCategory(CRUDBase[IssueCategory]):
    pass

category = CRUDCategory(IssueCategory)
