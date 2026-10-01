from app.models import FieldTeam

from .base import CRUDBase

class CRUDFieldTeam(CRUDBase[FieldTeam]):
    MODEL: type[FieldTeam] = FieldTeam
