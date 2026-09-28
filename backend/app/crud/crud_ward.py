from app.crud.base import CRUDBase
from app.models.ward import Ward

class CRUDWard(CRUDBase[Ward]):
    pass

ward = CRUDWard(Ward)
