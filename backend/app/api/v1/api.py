from fastapi import APIRouter
from .endpoints import auth
# from .endpoints import issues
# from .endpoints import departments
# from .endpoints import wards
# from .endpoints import categories
# from .endpoints import notifications

app = APIRouter(prefix="/v1")

app.include_router(auth.app, tags=["Authentication"])
# app.include_router(issues.app)
# app.include_router(departments.app)
# app.include_router(wards.app)
# app.include_router(categories.app)
# app.include_router(notifications.app)
