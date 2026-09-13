import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.outcome import (
    OutcomeAssessmentCreate,
    OutcomeAssessmentHistoryResponse,
    OutcomeAssessmentResponse,
)
from app.schemas.pilot import (
    PilotCreate,
    PilotEvidencePlanCreate,
    PilotEvidencePlanHistoryResponse,
    PilotEvidencePlanResponse,
    PilotListResponse,
    PilotOperationalHistoryResponse,
    PilotOperationalStateCreate,
    PilotOperationalStateResponse,
    PilotResponse,
)
from app.services.outcome_service import (
    create_outcome_assessment,
    get_latest_outcome_assessment,
    get_outcome_history,
)
from app.services.pilot_service import (
    create_evidence_plan_version,
    create_pilot,
    create_pilot_operational_state,
    get_evidence_plan_history,
    get_latest_evidence_plan,
    get_latest_pilot_operational_state,
    get_pilot,
    get_pilot_operational_history,
    list_challenge_pilots,
)

router = APIRouter(tags=["pilots"])


@router.post(
    "/challenges/{challenge_id}/pilots",
    response_model=PilotResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Authorize a new field Pilot for a Challenge",
)
def post_pilot(
    challenge_id: uuid.UUID,
    payload: PilotCreate,
    db: Session = Depends(get_db),
) -> PilotResponse:
    try:
        pilot = create_pilot(db, challenge_id, payload)
        db.commit()
        db.refresh(pilot)
        return PilotResponse.model_validate(pilot)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/challenges/{challenge_id}/pilots",
    response_model=PilotListResponse,
    summary="List pilots for a Challenge",
)
def get_challenge_pilots(
    challenge_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotListResponse:
    try:
        items, total = list_challenge_pilots(db, challenge_id)
        return PilotListResponse(
            items=[PilotResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/pilots/{pilot_id}",
    response_model=PilotResponse,
    summary="Get Pilot details by ID",
)
def get_pilot_detail(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotResponse:
    pilot = get_pilot(db, pilot_id)
    if pilot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pilot {pilot_id} not found.",
        )
    return PilotResponse.model_validate(pilot)


@router.post(
    "/pilots/{pilot_id}/operational-states",
    response_model=PilotOperationalStateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Append new versioned operational state for Pilot",
)
def post_operational_state(
    pilot_id: uuid.UUID,
    payload: PilotOperationalStateCreate,
    db: Session = Depends(get_db),
) -> PilotOperationalStateResponse:
    try:
        state = create_pilot_operational_state(db, pilot_id, payload)
        db.commit()
        db.refresh(state)
        return PilotOperationalStateResponse.model_validate(state)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/pilots/{pilot_id}/operational-states",
    response_model=PilotOperationalHistoryResponse,
    summary="Get operational state history for Pilot",
)
def get_operational_history(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotOperationalHistoryResponse:
    try:
        items, total = get_pilot_operational_history(db, pilot_id)
        return PilotOperationalHistoryResponse(
            items=[PilotOperationalStateResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/pilots/{pilot_id}/operational-states/latest",
    response_model=PilotOperationalStateResponse,
    summary="Get latest operational state for Pilot",
)
def get_latest_operational_state_endpoint(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotOperationalStateResponse:
    try:
        state = get_latest_pilot_operational_state(db, pilot_id)
        if state is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No operational state found for Pilot {pilot_id}.",
            )
        return PilotOperationalStateResponse.model_validate(state)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/pilots/{pilot_id}/evidence-plans",
    response_model=PilotEvidencePlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Append new versioned EvidencePlan for Pilot",
)
def post_evidence_plan(
    pilot_id: uuid.UUID,
    payload: PilotEvidencePlanCreate,
    db: Session = Depends(get_db),
) -> PilotEvidencePlanResponse:
    try:
        plan = create_evidence_plan_version(db, pilot_id, payload)
        db.commit()
        db.refresh(plan)
        return PilotEvidencePlanResponse.model_validate(plan)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/pilots/{pilot_id}/evidence-plans",
    response_model=PilotEvidencePlanHistoryResponse,
    summary="Get evidence plan history for Pilot",
)
def get_evidence_plans(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotEvidencePlanHistoryResponse:
    try:
        items, total = get_evidence_plan_history(db, pilot_id)
        return PilotEvidencePlanHistoryResponse(
            items=[PilotEvidencePlanResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/pilots/{pilot_id}/evidence-plans/latest",
    response_model=PilotEvidencePlanResponse,
    summary="Get latest evidence plan for Pilot",
)
def get_latest_evidence_plan_endpoint(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> PilotEvidencePlanResponse:
    try:
        plan = get_latest_evidence_plan(db, pilot_id)
        if plan is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No evidence plan found for Pilot {pilot_id}.",
            )
        return PilotEvidencePlanResponse.model_validate(plan)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/pilots/{pilot_id}/outcomes",
    response_model=OutcomeAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Append new OutcomeAssessment for Pilot",
)
def post_outcome_assessment(
    pilot_id: uuid.UUID,
    payload: OutcomeAssessmentCreate,
    db: Session = Depends(get_db),
) -> OutcomeAssessmentResponse:
    try:
        assessment = create_outcome_assessment(db, pilot_id, payload)
        db.commit()
        db.refresh(assessment)
        return OutcomeAssessmentResponse.model_validate(assessment)
    except ValueError as e:
        db.rollback()
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        if "requires human actor attribution" in msg.lower():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)


@router.get(
    "/pilots/{pilot_id}/outcomes",
    response_model=OutcomeAssessmentHistoryResponse,
    summary="Get outcome assessment history for Pilot",
)
def get_outcomes(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> OutcomeAssessmentHistoryResponse:
    try:
        items, total = get_outcome_history(db, pilot_id)
        return OutcomeAssessmentHistoryResponse(
            items=[OutcomeAssessmentResponse.model_validate(i) for i in items],
            total=total,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/pilots/{pilot_id}/outcomes/latest",
    response_model=OutcomeAssessmentResponse,
    summary="Get latest outcome assessment for Pilot",
)
def get_latest_outcome_endpoint(
    pilot_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> OutcomeAssessmentResponse:
    try:
        assessment = get_latest_outcome_assessment(db, pilot_id)
        if assessment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No outcome assessment found for Pilot {pilot_id}.",
            )
        return OutcomeAssessmentResponse.model_validate(assessment)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
