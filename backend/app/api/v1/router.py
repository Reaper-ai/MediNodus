# from fastapi import APIRouter
# from .endpoints import reports, users, meds  # <-- add reports

# api_router = APIRouter()
# api_router.include_router(reports.router, prefix="", tags=["Reports"])
# api_router.include_router(users.router, prefix="", tags=["Users"])
# api_router.include_router(meds.router, prefix="", tags=["Medications"])
from fastapi import APIRouter
from .endpoints import reports

api_router = APIRouter()
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])