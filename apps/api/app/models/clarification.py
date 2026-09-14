from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.challenge import Challenge


class ClarificationRequest(Base):
    __tablename__ = "clarification_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challenge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("challenges.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    requested_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="OPEN", index=True
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    challenge: Mapped["Challenge"] = relationship("Challenge")
    requested_by_actor: Mapped["Actor"] = relationship("Actor")
    responses: Mapped[List["ClarificationResponse"]] = relationship(
        "ClarificationResponse",
        back_populates="request",
        cascade="all, delete-orphan",
        order_by="ClarificationResponse.responded_at",
    )


class ClarificationResponse(Base):
    __tablename__ = "clarification_responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clarification_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    response: Mapped[str] = mapped_column(Text, nullable=False)
    responded_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    responded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    request: Mapped["ClarificationRequest"] = relationship(
        "ClarificationRequest", back_populates="responses"
    )
    responded_by_actor: Mapped["Actor"] = relationship("Actor")
