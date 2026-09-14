from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, Table, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import QualificationRoute
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.evidence import Evidence


# Association table for QualificationDecision <-> Evidence traceability
qualification_decision_evidence = Table(
    "qualification_decision_evidence",
    Base.metadata,
    Column(
        "qualification_decision_id",
        UUID(as_uuid=True),
        ForeignKey("qualification_decisions.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
    Column(
        "evidence_id",
        UUID(as_uuid=True),
        ForeignKey("evidences.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


class QualificationDecision(Base):
    """Qualification Decision Entity Model.

    Represents a finalized human qualification decision for a Challenge.
    Stores append-only versioned history of qualification decisions.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. Facts != Decisions != Readiness != Outcomes.
    2. QualificationDecision represents a finalized HUMAN decision with actor attribution.
       No AI-authoritative decisions, ai_approved, or automatic route calculations.
    3. Old decision versions remain preserved; version begins at 1.
    """

    __tablename__ = "qualification_decisions"
    __table_args__ = (
        UniqueConstraint(
            "challenge_id", "version", name="uq_qualification_decision_challenge_version"
        ),
        CheckConstraint("version >= 1", name="ck_qualification_decision_version_min"),
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
    route: Mapped[QualificationRoute] = mapped_column(
        Enum(
            QualificationRoute,
            name="qualification_route_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

    decided_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="qualification_decisions"
    )
    decided_by_actor: Mapped["Actor"] = relationship(
        "Actor", back_populates="qualification_decisions_made"
    )
    evidence_items: Mapped[List["Evidence"]] = relationship(
        "Evidence",
        secondary=qualification_decision_evidence,
        back_populates="qualification_decisions",
    )
