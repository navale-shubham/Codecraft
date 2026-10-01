from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends

from app.core import get_db
from app.schemas import ApiResponse, CitizenCreateRequest
from app.crud import user as crud_user
from app.models import User, UserRole
from app.core import get_password_hash

app = APIRouter(prefix="/citizens")

@app.post('/', response_model=ApiResponse)
def create_citizen(payload: CitizenCreateRequest, db: Annotated[Session, Depends(get_db)]):
    try:
        crud_user.create(db, obj_in=User(
            organization_id='',
            name=payload.name,
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role=UserRole.CITIZEN
        ))
    
    except Exception as e:
        raise HTTPException(status_code=401, detail='User not created.')

@app.get('/me')
def get_current_citizen(db: Annotated[Session, Depends(get_db)]):
    user = crud_user.get()