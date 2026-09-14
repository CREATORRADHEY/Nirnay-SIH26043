from app.api.v1.admin import router as admin_router
from fastapi import APIRouter

from app.api.v1.challenges import router as challenges_router
from app.api.v1.commitments import router as commitments_router
from app.api.v1.hei_matching import router as hei_matching_router
from app.api.v1.pilots import router as pilots_router
from app.api.v1.qualification import router as qualification_router
from app.api.v1.readiness import router as readiness_router
from app.api.v1.review_queue import router as review_queue_router
from app.api.v1.ai_assistance import router as ai_assistance_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(challenges_router)
api_v1_router.include_router(review_queue_router)
api_v1_router.include_router(qualification_router)
api_v1_router.include_router(hei_matching_router)
api_v1_router.include_router(commitments_router)
api_v1_router.include_router(readiness_router)
api_v1_router.include_router(pilots_router)
api_v1_router.include_router(ai_assistance_router)

api_v1_router.include_router(admin_router)
