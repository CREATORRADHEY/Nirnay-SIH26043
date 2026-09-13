from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge


class Evidence(Base):
    """Evidence Model.

    Represents metadata/references for supporting material (photo, video, document,
    location, field note, etc.) linked to a Challenge.

    CRITICAL ARCHITECTURAL BOUNDARY:
    Evidence stores raw supporting evidence metadata. It MUST NOT contain
    EvidenceConclusion or evaluation decisions in this foundation phase.
    """

    __tablename__ = "evidences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    submitted_by_actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    storage_reference: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    captured_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    challenge: Mapped["Challenge"] = relationship(
        "Challenge", back_populates="evidences"
    )
    submitted_by_actor: Mapped[Optional["Actor"]] = relationship(
        "Actor", back_populates="submitted_evidences"
    )
