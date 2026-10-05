from fastapi import APIRouter

from .endpoints import auth
from .endpoints import citizens
from .endpoints import departments
from .endpoints import field_staff
from .endpoints import organizations


app = APIRouter(prefix="/v1")


app.include_router(auth.app, tags=["Authentication"])
app.include_router(citizens.app, tags=["Citizens"])
app.include_router(departments.app, tags=["Departments"])
app.include_router(field_staff.app, tags=["Field Staff"])
app.include_router(organizations.app, tags=["Organizations"])
