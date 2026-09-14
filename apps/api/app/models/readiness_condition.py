from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, String, Table, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ConditionStatus
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.commitment import Commitment
    from app.models.readiness_decision import ReadinessDecision


# Association table: ReadinessCondition <-> Commitment dependencies
readiness_condition_commitment_dependencies = Table(
    "readiness_condition_commitment_dependencies",
    Base.metadata,
    Column(
        "readiness_condition_id",
        UUID(as_uuid=True),
        ForeignKey("readiness_conditions.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
    Column(
        "commitment_id",
        UUID(as_uuid=True),
        ForeignKey("commitments.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


class ReadinessCondition(Base):
    """Readiness Condition Entity Model.

    Represents versioned evaluation of a specific prerequisite required
    before a Challenge can proceed toward pilot authorization.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. Append-oriented history; UNIQUE(challenge_id, condition_key, version).
    2. Version >= 1.
    3. Explicitly links to exact commitment versions relied upon via
       readiness_condition_commitment_dependencies association table.
    """

    __tablename__ = "readiness_conditions"
    __table_args__ = (
        UniqueConstraint(
            "challenge_id",
            "condition_key",
            "version",
            name="uq_readiness_condition_challenge_key_version",
        ),
        CheckConstraint("version >= 1", name="ck_readiness_condition_version_min"),
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
    condition_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    status: Mapped[ConditionStatus] = mapped_column(
        Enum(
            ConditionStatus,
            name="condition_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

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
    valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="readiness_conditions"
    )
    assessed_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="assessed_readiness_conditions"
    )
    commitment_dependencies: Mapped[List["Commitment"]] = relationship(
        "Commitment",
        secondary=readiness_condition_commitment_dependencies,
        back_populates="dependent_readiness_conditions",
    )
    readiness_decisions: Mapped[List["ReadinessDecision"]] = relationship(
        "ReadinessDecision",
        secondary="readiness_decision_conditions",
        back_populates="conditions",
    )
