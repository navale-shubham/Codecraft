"""
Ward administrative API endpoints.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.schemas.common import ApiResponse
from app.core.database import get_db
from app.crud.crud_ward import ward

app = APIRouter(prefix="/wards", tags=["Wards"])

@app.get("", response_model=ApiResponse)
def list_wards(db: Session = Depends(get_db)):
    wards = ward.get_multi(db=db)
    return ApiResponse(data=wards)
