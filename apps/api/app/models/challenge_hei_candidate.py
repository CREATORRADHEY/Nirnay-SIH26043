from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge
    from app.models.organization import Organization


class ChallengeHEICandidate(Base):
    """Challenge HEI Candidate Model.

    Represents a NON-AUTHORITATIVE candidate HEI organization identified as potentially
    relevant to a Challenge.

    CRITICAL ARCHITECTURAL BOUNDARY:
    MATCHING != ASSIGNMENT != COMMITMENT.
    Candidate matching ONLY indicates potential relevance. It MUST NOT contain
    accepted/declined status, faculty commitment, resource allocation, pilot readiness,
    or fake match scores.
    """

    __tablename__ = "challenge_hei_candidates"
    __table_args__ = (
        UniqueConstraint("challenge_id", "organization_id", name="uq_challenge_hei_candidate"),
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
    match_method: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

    created_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
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

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="hei_candidates"
    )
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="challenge_candidates"
    )
    created_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="created_hei_candidates"
    )
