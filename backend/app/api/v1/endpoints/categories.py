"""
Issue category API endpoints.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.schemas.common import ApiResponse
from app.core.database import get_db
from app.crud import category

app = APIRouter(prefix="/categories", tags=["Categories"])

@app.get("", response_model=ApiResponse)
def list_categories(db: Session = Depends(get_db)):
    categories = category.get_multi(db=db)
    return ApiResponse(data=categories)
