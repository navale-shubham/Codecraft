from app.crud.base import CRUDBase
from app.models.notification import Notification

class CRUDNotification(CRUDBase[Notification]):
    pass

notification = CRUDNotification(Notification)
