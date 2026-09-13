import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_optional_actor
from app.models.actor import Actor
from app.schemas.hei_matching import (
    HEICapabilityResponse,
    HEICandidateCreate,
    HEICandidateListResponse,
    HEICandidateResponse,
    HEIOrganizationListResponse,
    HEIOrganizationResponse,
)
from app.services.hei_matching_service import (
    create_hei_candidate,
    list_hei_candidates,
    list_organization_capabilities,
    list_hei_organizations,
)

router = APIRouter(tags=["hei-matching"])


@router.post(
    "/challenges/{challenge_id}/hei-candidates",
    response_model=HEICandidateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create non-authoritative HEI candidate match for qualified Challenge",
)
def post_hei_candidate(
    challenge_id: uuid.UUID,
    payload: HEICandidateCreate,
    actor: Optional[Actor] = Depends(get_optional_actor),
    db: Session = Depends(get_db),
) -> HEICandidateResponse:
    if actor:
        payload.created_by_actor_id = actor.id

    try:
        candidate = create_hei_candidate(db, challenge_id, payload)
        db.commit()
        db.refresh(candidate)
        return HEICandidateResponse.model_validate(candidate)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        if "manual match requires" in msg.lower():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/hei-candidates",
    response_model=HEICandidateListResponse,
    summary="List candidate HEIs for Challenge",
)
def get_hei_candidates(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> HEICandidateListResponse:
    try:
        items, total = list_hei_candidates(db, challenge_id)
        return HEICandidateListResponse(
            items=[HEICandidateResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/organizations/{organization_id}/hei-capabilities",
    response_model=List[HEICapabilityResponse],
    summary="List active HEI capabilities for Organization",
)
def get_organization_capabilities(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> List[HEICapabilityResponse]:
    try:
        items, _ = list_organization_capabilities(db, organization_id)
        return [HEICapabilityResponse.model_validate(i) for i in items]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/hei-organizations",
    response_model=HEIOrganizationListResponse,
    summary="List HEI organizations with active capabilities",
)
def get_hei_organizations(
    db: Session = Depends(get_db),
) -> HEIOrganizationListResponse:
    items, total = list_hei_organizations(db)
    return HEIOrganizationListResponse(
        items=[HEIOrganizationResponse.model_validate(i) for i in items],
        total=total,
    )
