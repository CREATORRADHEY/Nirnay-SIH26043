from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.outcome_assessment import OutcomeAssessment
    from app.models.pilot import Pilot


class PilotEvidencePlan(Base):
    """Pilot Evidence Plan Entity Model.

    Defines BEFORE/AROUND pilot execution what will be measured and how.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. Preserves baseline_definition and denominator_definition.
    2. Versioned append-only history; UNIQUE(pilot_id, version).
    """

    __tablename__ = "pilot_evidence_plans"
    __table_args__ = (
        UniqueConstraint(
            "pilot_id", "version", name="uq_pilot_evidence_plan_pilot_version"
        ),
        CheckConstraint("version >= 1", name="ck_pilot_evidence_plan_version_min"),
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
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    primary_metric: Mapped[str] = mapped_column(String(255), nullable=False)
    baseline_definition: Mapped[str] = mapped_column(Text, nullable=False)
    denominator_definition: Mapped[str] = mapped_column(Text, nullable=False)
    data_collection_method: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_window: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    success_criteria: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    limitations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    pilot: Mapped["Pilot"] = relationship(
        "Pilot", back_populates="evidence_plans"
    )
    created_by_actor: Mapped["Actor"] = relationship(
        "Actor", back_populates="evidence_plans_created"
    )
    outcome_assessments: Mapped[List["OutcomeAssessment"]] = relationship(
        "OutcomeAssessment", back_populates="evidence_plan"
    )
