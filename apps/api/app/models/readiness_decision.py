from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, Table, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ReadinessStatus
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.commitment import Commitment
    from app.models.readiness_condition import ReadinessCondition


# Association table: ReadinessDecision <-> ReadinessCondition traceability
readiness_decision_conditions = Table(
    "readiness_decision_conditions",
    Base.metadata,
    Column(
        "readiness_decision_id",
        UUID(as_uuid=True),
        ForeignKey("readiness_decisions.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
    Column(
        "readiness_condition_id",
        UUID(as_uuid=True),
        ForeignKey("readiness_conditions.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


class ReadinessDecision(Base):
    """Readiness Decision Entity Model.

    Stores append-only overall readiness decisions for a Challenge.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. PILOT_READY requires explicit human actor sign-off (decided_by_actor_id IS NOT NULL).
       Enforced via CheckConstraint and domain logic.
    2. System-triggered invalidation (e.g. REVIEW_REQUIRED) may have decided_by_actor_id = NULL
       and records triggered_by_commitment_id.
    3. UNIQUE(challenge_id, version).
    """

    __tablename__ = "readiness_decisions"
    __table_args__ = (
        UniqueConstraint(
            "challenge_id", "version", name="uq_readiness_decision_challenge_version"
        ),
        CheckConstraint("version >= 1", name="ck_readiness_decision_version_min"),
        CheckConstraint(
            "status != 'PILOT_READY' OR decided_by_actor_id IS NOT NULL",
            name="ck_readiness_decision_pilot_ready_human_actor",
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
    status: Mapped[ReadinessStatus] = mapped_column(
        Enum(
            ReadinessStatus,
            name="readiness_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

    decided_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    triggered_by_commitment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("commitments.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="readiness_decisions"
    )
    decided_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="readiness_decisions_made"
    )
    triggered_by_commitment: Mapped[Optional["Commitment"]] = relationship(
        "Commitment", back_populates="triggered_readiness_reviews"
    )
    conditions: Mapped[List["ReadinessCondition"]] = relationship(
        "ReadinessCondition",
        secondary=readiness_decision_conditions,
        back_populates="readiness_decisions",
    )
