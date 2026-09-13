from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import CommitmentStatus
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.organization import Organization


class Commitment(Base):
    """Commitment Entity Model.

    Represents an auditable, versioned commitment between a Challenge and an Organization.
    Tracks commitment lifecycle: PROPOSED -> OFFERED -> ACCEPTED / DECLINED / WITHDRAWN / EXPIRED.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    1. MATCHING != COMMITMENT. Candidates indicate potential relevance only; Commitment is separate.
    2. COMMITMENT != READINESS. ACCEPTED commitment is a prerequisite, but does not imply PILOT_READY.
    3. Old commitment versions remain preserved; uniqueness on (challenge, org, type, version).
    4. Must be attributable to a human Actor via recorded_by_actor_id.
    """

    __tablename__ = "commitments"
    __table_args__ = (
        UniqueConstraint(
            "challenge_id",
            "organization_id",
            "commitment_type",
            "version",
            name="uq_commitment_challenge_org_type_version",
        ),
        CheckConstraint("version >= 1", name="ck_commitment_version_min"),
        CheckConstraint(
            "valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from",
            name="ck_commitment_validity_window",
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
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    commitment_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[CommitmentStatus] = mapped_column(
        Enum(
            CommitmentStatus,
            name="commitment_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    scope_description: Mapped[str] = mapped_column(Text, nullable=False)

    recorded_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    valid_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="commitments"
    )
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="commitments"
    )
    recorded_by_actor: Mapped["Actor"] = relationship(
        "Actor", back_populates="recorded_commitments"
    )
