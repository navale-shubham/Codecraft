from app.models import Ward

from .base import CRUDBase

class CRUDWard(CRUDBase[Ward]):
    MODEL: type[Ward] = Ward
