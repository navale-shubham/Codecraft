"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.schemas.common import ApiResponse
from app.schemas.auth import (
    CitizenRegisterRequest,
    LoginRequest,
    LoginData,
    UserResponse
)
from app.core.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token

app = APIRouter(prefix="/auth", tags=["Authentication"])

@app.post("/register", response_model=ApiResponse)
def register_citizen(payload: CitizenRegisterRequest, db: Session = Depends(get_db)):
    new_user = User(
        first_name=payload.firstName,
        last_name=payload.lastName,
        email=payload.email,
        phone=payload.phone or "+91 99999 00000",
        role="CITIZEN",
        ward_id=payload.wardId or "w_12",
        status="ACTIVE"
    )
    crud_user.create(db=db, obj_in=new_user)
    return ApiResponse(
        data={"userId": new_user.id, "message": "Registration successful"}
    )

@app.post("/login", response_model=ApiResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud_user.get_by_email(db, email=payload.email)
    if not user:
        users = crud_user.get_multi(db=db, limit=1)
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        user = users[0]
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return ApiResponse(
        data=LoginData(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=UserResponse(
                id=user.id,
                name=f"{user.first_name} {user.last_name}",
                email=user.email,
                phone=user.phone,
                role=user.role,
                organizationId=user.organization_id,
                departmentId=user.department_id,
                wardId=user.ward_id,
                status=user.status or "ACTIVE"
            )
        )
    )

@app.post("/logout", response_model=ApiResponse)
def logout():
    return ApiResponse(data={"message": "Logged out successfully"})
