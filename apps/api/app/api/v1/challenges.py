import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.challenge import ChallengeCreate, ChallengeListResponse, ChallengeResponse
from app.schemas.evidence import EvidenceCreate, EvidenceListResponse, EvidenceResponse
from app.services.challenge_service import create_challenge, get_challenge, list_challenges
from app.services.evidence_service import create_evidence, list_challenge_evidence

router = APIRouter(tags=["challenges"])


@router.post(
    "/challenges",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new Challenge Passport record",
)
def submit_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
) -> ChallengeResponse:
    try:
        challenge = create_challenge(db, payload)
        db.commit()
        db.refresh(challenge)
        return ChallengeResponse.model_validate(challenge)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges",
    response_model=ChallengeListResponse,
    summary="List Challenge Passport records",
)
def get_challenges(
    district: Optional[str] = Query(None, description="Filter by district"),
    domain: Optional[str] = Query(None, description="Filter by domain"),
    source_type: Optional[str] = Query(None, description="Filter by source_type"),
    limit: int = Query(20, ge=1, le=100, description="Page limit (max 100)"),
    offset: int = Query(0, ge=0, description="Page offset"),
    db: Session = Depends(get_db),
) -> ChallengeListResponse:
    items, total = list_challenges(
        db, district=district, domain=domain, source_type=source_type, limit=limit, offset=offset
    )
    return ChallengeListResponse(
        items=items,
        total=total,
        limit=max(1, min(limit, 100)),
        offset=max(0, offset),
    )


@router.get(
    "/challenges/{challenge_id}",
    response_model=ChallengeResponse,
    summary="Retrieve factual Challenge Passport details",
)
def get_challenge_detail(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ChallengeResponse:
    challenge = get_challenge(db, challenge_id)
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge {challenge_id} not found.",
        )
    return ChallengeResponse.model_validate(challenge)


@router.post(
    "/challenges/{challenge_id}/evidence",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach Evidence metadata to a Challenge",
)
def add_challenge_evidence(
    challenge_id: uuid.UUID,
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
) -> EvidenceResponse:
    try:
        evidence = create_evidence(db, challenge_id, payload)
        db.commit()
        db.refresh(evidence)
        return EvidenceResponse.model_validate(evidence)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/challenges/{challenge_id}/evidence",
    response_model=EvidenceListResponse,
    summary="List Evidence metadata for a Challenge",
)
def get_challenge_evidence(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> EvidenceListResponse:
    try:
        items, total = list_challenge_evidence(db, challenge_id)
        return EvidenceListResponse(items=items, total=total)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
