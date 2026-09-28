"""
Notification management API endpoints.
"""

from fastapi import APIRouter, Query, Depends
from sqlmodel import Session, select
from app.schemas.common import ApiResponse
from app.core.database import get_db
from app.crud import notification as crud_notification
from app.models.notification import Notification

app = APIRouter(prefix="/notifications", tags=["Notifications"])

@app.get("", response_model=ApiResponse)
def get_notifications(user_id: str | None = Query(None), db: Session = Depends(get_db)):
    if user_id:
        user_notifs = db.exec(select(Notification).where(Notification.user_id == user_id)).all()
        return ApiResponse(data=user_notifs)
    notifs = crud_notification.get_multi(db=db)
    return ApiResponse(data=notifs)

@app.patch("/{notif_id}/read", response_model=ApiResponse)
def mark_read(notif_id: str, db: Session = Depends(get_db)):
    notif = crud_notification.get(db=db, id=notif_id)
    if notif:
        notif.is_read = True
        db.add(notif)
        db.commit()
    return ApiResponse(data={"success": True})

@app.post("/read-all", response_model=ApiResponse)
def mark_all_read(db: Session = Depends(get_db)):
    notifs = crud_notification.get_multi(db=db, limit=1000)
    for n in notifs:
        n.is_read = True
        db.add(n)
    db.commit()
    return ApiResponse(data={"success": True})
