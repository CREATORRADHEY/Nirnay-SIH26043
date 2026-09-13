from fastapi import APIRouter

from app.api.v1.challenges import router as challenges_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(challenges_router)
