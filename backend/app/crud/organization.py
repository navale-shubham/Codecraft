from app.models import Organization

from .base import CRUDBase

class CRUDOrganization(CRUDBase[Organization]):
    MODEL: type[Organization] = Organization
