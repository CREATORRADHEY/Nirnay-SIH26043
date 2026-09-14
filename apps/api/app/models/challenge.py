from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.pilot import Pilot
    from app.models.readiness_condition import ReadinessCondition
    from app.models.readiness_decision import ReadinessDecision
    from app.models.commitment import Commitment
    from app.models.challenge_hei_candidate import ChallengeHEICandidate
    from app.models.evidence import Evidence
    from app.models.organization import Organization
    from app.models.qualification_decision import QualificationDecision


class Challenge(Base):
    """Challenge Entity Model.

    Represents the durable factual core of the Challenge Passport.
    Stores factual details about the submitted societal problem.

    CRITICAL ARCHITECTURAL BOUNDARY:
    Facts != Decisions != Readiness != Outcomes.
    This model MUST NOT contain qualification decisions, readiness states,
    pilot statuses, AI scores, or outcome evaluations.
    """

    __tablename__ = "challenges"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Jharkhand")

    submitted_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    source_organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships - Restrictive/Non-cascading to preserve audit history
    submitted_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="submitted_challenges"
    )
    source_organization: Mapped[Optional["Organization"]] = relationship(
        "Organization", back_populates="sourced_challenges"
    )
    evidences: Mapped[List["Evidence"]] = relationship(
        "Evidence", back_populates="challenge"
    )
    qualification_decisions: Mapped[List["QualificationDecision"]] = relationship(
        "QualificationDecision", back_populates="challenge"
    )
    hei_candidates: Mapped[List["ChallengeHEICandidate"]] = relationship(
        "ChallengeHEICandidate", back_populates="challenge"
    )
    commitments: Mapped[List["Commitment"]] = relationship(
        "Commitment", back_populates="challenge"
    )
    readiness_conditions: Mapped[List["ReadinessCondition"]] = relationship(
        "ReadinessCondition", back_populates="challenge"
    )
    readiness_decisions: Mapped[List["ReadinessDecision"]] = relationship(
        "ReadinessDecision", back_populates="challenge"
    )
    pilots: Mapped[List["Pilot"]] = relationship(
        "Pilot", back_populates="challenge"
    )
