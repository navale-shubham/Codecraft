from app.models import Department

from .base import CRUDBase


class CRUDDepartment(CRUDBase[Department]):
    MODEL: type[Department] = Department
