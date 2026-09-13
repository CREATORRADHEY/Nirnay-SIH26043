from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, Table, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import EvidenceConclusion
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.evidence import Evidence
    from app.models.pilot import Pilot
    from app.models.pilot_evidence_plan import PilotEvidencePlan


# Association table for OutcomeAssessment <-> Evidence traceability
outcome_assessment_evidence = Table(
    "outcome_assessment_evidence",
    Base.metadata,
    Column(
        "outcome_assessment_id",
        UUID(as_uuid=True),
        ForeignKey("outcome_assessments.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
    Column(
        "evidence_id",
        UUID(as_uuid=True),
        ForeignKey("evidences.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


class OutcomeAssessment(Base):
    """Outcome Assessment Entity Model.

    Represents human-reviewed interpretation of evidence after/during pilot.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. OperationalStatus != EvidenceConclusion (COMPLETED does NOT imply VALIDATED).
    2. References exact evidence_plan_id version.
    3. Human actor attribution required for VALIDATED, ITERATE, INCONCLUSIVE.
    """

    __tablename__ = "outcome_assessments"
    __table_args__ = (
        UniqueConstraint(
            "pilot_id", "version", name="uq_outcome_assessment_pilot_version"
        ),
        CheckConstraint("version >= 1", name="ck_outcome_assessment_version_min"),
        CheckConstraint(
            "conclusion = 'NOT_REVIEWED' OR assessed_by_actor_id IS NOT NULL",
            name="ck_outcome_assessment_human_actor",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    pilot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pilots.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    evidence_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pilot_evidence_plans.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    conclusion: Mapped[EvidenceConclusion] = mapped_column(
        Enum(
            EvidenceConclusion,
            name="evidence_conclusion_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    limitations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    assessed_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    assessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    pilot: Mapped["Pilot"] = relationship(
        "Pilot", back_populates="outcome_assessments"
    )
    evidence_plan: Mapped["PilotEvidencePlan"] = relationship(
        "PilotEvidencePlan", back_populates="outcome_assessments"
    )
    assessed_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="outcome_assessments_made"
    )
    evidence_items: Mapped[List["Evidence"]] = relationship(
        "Evidence",
        secondary=outcome_assessment_evidence,
        back_populates="outcome_assessments",
    )
