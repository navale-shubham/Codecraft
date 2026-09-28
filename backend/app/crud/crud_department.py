from app.crud.base import CRUDBase
from app.models.department import Department

class CRUDDepartment(CRUDBase[Department]):
    pass

department = CRUDDepartment(Department)
