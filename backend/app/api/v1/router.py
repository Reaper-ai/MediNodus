from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
# from app.api.v1.endpoints.reports import router as report_router
from app.api.v1.endpoints.meds import router as meds_router


api_router = APIRouter()
api_router.include_router(auth_router)
# api_router.include_router(report_router)
api_router.include_router(meds_router)
