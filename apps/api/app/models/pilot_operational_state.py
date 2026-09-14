from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import OperationalStatus
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.actor import Actor
    from app.models.pilot import Pilot


class PilotOperationalState(Base):
    """Pilot Operational State Entity Model.

    Tracks append-only operational lifecycle history for field pilots
    (PLANNED -> ACTIVE -> COMPLETED / STOPPED).

    CRITICAL ARCHITECTURAL BOUNDARY:
    OperationalStatus tracks execution ONLY. It does NOT imply outcome validation or social impact.
    """

    __tablename__ = "pilot_operational_states"
    __table_args__ = (
        UniqueConstraint(
            "pilot_id", "version", name="uq_pilot_operational_state_pilot_version"
        ),
        CheckConstraint("version >= 1", name="ck_pilot_operational_state_version_min"),
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
    status: Mapped[OperationalStatus] = mapped_column(
        Enum(
            OperationalStatus,
            name="operational_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

    recorded_by_actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("actors.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    pilot: Mapped["Pilot"] = relationship(
        "Pilot", back_populates="operational_states"
    )
    recorded_by_actor: Mapped["Actor"] = relationship(
        "Actor", back_populates="pilot_operational_states_recorded"
    )
