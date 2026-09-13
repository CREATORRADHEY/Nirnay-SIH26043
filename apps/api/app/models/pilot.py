from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.organization import Organization
    from app.models.outcome_assessment import OutcomeAssessment
    from app.models.pilot_evidence_plan import PilotEvidencePlan
    from app.models.pilot_operational_state import PilotOperationalState
    from app.models.readiness_decision import ReadinessDecision


class Pilot(Base):
    """Pilot Entity Model.

    Represents a concrete field pilot authorized from a specific historical
    PILOT_READY readiness decision.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. PILOT_READY != PILOT COMPLETED != OUTCOME VALIDATED.
    2. Must record authorized_by_readiness_decision_id referencing exact historical decision.
    3. Site description must NOT store precise citizen residential PII.
    """

    __tablename__ = "pilots"
    __table_args__ = (
        CheckConstraint(
            "planned_end IS NULL OR planned_start IS NULL OR planned_end >= planned_start",
            name="ck_pilot_planned_dates_valid",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    authorized_by_readiness_decision_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("readiness_decisions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    host_organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    site_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    planned_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    planned_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="pilots"
    )
    authorized_by_readiness_decision: Mapped["ReadinessDecision"] = relationship(
        "ReadinessDecision", back_populates="authorized_pilots"
    )
    host_organization: Mapped[Optional["Organization"]] = relationship(
        "Organization", back_populates="hosted_pilots"
    )
    created_by_actor: Mapped["Actor"] = relationship(
        "Actor", back_populates="created_pilots"
    )
    operational_states: Mapped[List["PilotOperationalState"]] = relationship(
        "PilotOperationalState", back_populates="pilot"
    )
    evidence_plans: Mapped[List["PilotEvidencePlan"]] = relationship(
        "PilotEvidencePlan", back_populates="pilot"
    )
    outcome_assessments: Mapped[List["OutcomeAssessment"]] = relationship(
        "OutcomeAssessment", back_populates="pilot"
    )
