from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.evidence import Evidence
    from app.models.organization import Organization

# Dialect-compatible JSON type (JSONB on PostgreSQL, JSON on SQLite)
JSONType = JSON().with_variant(JSONB(astext_type=Text()), "postgresql")


class DecisionAssuranceRecord(Base):
    """Decision Assurance Entity Model.

    Stores evidence-backed, criteria-based, rationale-required, reviewable,
    and versioned decision assurance metadata for authoritative gates
    (QUALIFICATION, READINESS, OUTCOME).

    CRITICAL GOVERNANCE BOUNDARIES:
    1. We do not trust a reviewer blindly; we trust a reviewable decision process.
    2. AI advisory snapshot is stored for observational agreement analysis ONLY.
    3. AI disagreement or rubric uncertainty triggers independent second review.
    4. Second reviewer MUST NOT equal the first reviewer (enforced server-side).
    5. No fake correctness scores or confidence metrics.
    """

    __tablename__ = "decision_assurance_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    decision_type: Mapped[str] = mapped_column(
        Text, nullable=False, index=True
    )  # QUALIFICATION, READINESS, OUTCOME
    authoritative_decision_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    reviewer_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    reviewer_organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    rubric_version: Mapped[str] = mapped_column(Text, nullable=False, default="v1")
    rubric_answers: Mapped[Dict[str, Any]] = mapped_column(JSONType, nullable=False, default=dict)
    evidence_ids: Mapped[List[str]] = mapped_column(JSONType, nullable=False, default=list)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    limitations_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    ai_advisory_snapshot: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType, nullable=True)
    ai_agreement_status: Mapped[str] = mapped_column(
        Text, nullable=False, default="NOT_APPLICABLE"
    )  # AGREEMENT, DISAGREEMENT, NOT_APPLICABLE

    conflict_declared: Mapped[str] = mapped_column(
        Text, nullable=False, default="NO_KNOWN_CONFLICT"
    )  # NO_KNOWN_CONFLICT, POTENTIAL_CONFLICT

    second_review_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    second_review_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_status: Mapped[str] = mapped_column(
        Text, nullable=False, default="SINGLE_REVIEWED"
    )  # SINGLE_REVIEWED, SECOND_REVIEW_PENDING, AGREED, DISAGREED, RESOLVED

    second_reviewer_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    second_review_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    second_review_decision: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    disagreement_resolved_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    resolution_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    superseded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship("Challenge")
    reviewer_actor: Mapped["Actor"] = relationship(
        "Actor", foreign_keys=[reviewer_actor_id]
    )
    second_reviewer_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", foreign_keys=[second_reviewer_actor_id]
    )
    resolver_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", foreign_keys=[disagreement_resolved_by_actor_id]
    )
    review_requests: Mapped[List["DecisionReviewRequest"]] = relationship(
        "DecisionReviewRequest", back_populates="assurance_record"
    )


class DecisionReviewRequest(Base):
    """Decision Review Request / Appeal Model.

    Allows an affected stakeholder to request an independent review of an existing decision.
    Does NOT overwrite or delete the original decision history.
    """

    __tablename__ = "decision_review_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    assurance_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("decision_assurance_records.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    requested_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidences.id", ondelete="RESTRICT"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        Text, nullable=False, default="PENDING"
    )  # PENDING, REVIEWED, REJECTED

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    assurance_record: Mapped["DecisionAssuranceRecord"] = relationship(
        "DecisionAssuranceRecord", back_populates="review_requests"
    )
    requested_by_actor: Mapped["Actor"] = relationship(
        "Actor", foreign_keys=[requested_by_actor_id]
    )
