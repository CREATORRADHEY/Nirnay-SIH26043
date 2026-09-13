from fastapi import APIRouter

from app.api.v1.challenges import router as challenges_router
from app.api.v1.hei_matching import router as hei_matching_router
from app.api.v1.qualification import router as qualification_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(challenges_router)
api_v1_router.include_router(qualification_router)
api_v1_router.include_router(hei_matching_router)
