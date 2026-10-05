from app.models import IssueMedia

from .base import CRUDBase


class CRUDIssueMedia(CRUDBase[IssueMedia]):
    MODEL: type[IssueMedia] = IssueMedia
