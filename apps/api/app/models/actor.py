from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.challenge import Challenge
    from app.models.readiness_condition import ReadinessCondition
    from app.models.readiness_decision import ReadinessDecision
    from app.models.commitment import Commitment
    from app.models.challenge_hei_candidate import ChallengeHEICandidate
    from app.models.evidence import Evidence
    from app.models.organization_membership import OrganizationMembership
    from app.models.qualification_decision import QualificationDecision


class Actor(Base):
    """Actor Entity Model.

    Represents a known platform participant for identity attribution and audit records.
    Does NOT contain authentication credentials, passwords, or RBAC logic.
    """

    __tablename__ = "actors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships - Non-cascading to preserve audit history
    memberships: Mapped[List["OrganizationMembership"]] = relationship(
        "OrganizationMembership", back_populates="actor"
    )
    submitted_challenges: Mapped[List["Challenge"]] = relationship(
        "Challenge", back_populates="submitted_by_actor"
    )
    submitted_evidences: Mapped[List["Evidence"]] = relationship(
        "Evidence", back_populates="submitted_by_actor"
    )
    qualification_decisions_made: Mapped[List["QualificationDecision"]] = relationship(
        "QualificationDecision", back_populates="decided_by_actor"
    )
    created_hei_candidates: Mapped[List["ChallengeHEICandidate"]] = relationship(
        "ChallengeHEICandidate", back_populates="created_by_actor"
    )
    recorded_commitments: Mapped[List["Commitment"]] = relationship(
        "Commitment", back_populates="recorded_by_actor"
    )
    assessed_readiness_conditions: Mapped[List["ReadinessCondition"]] = relationship(
        "ReadinessCondition", back_populates="assessed_by_actor"
    )
    readiness_decisions_made: Mapped[List["ReadinessDecision"]] = relationship(
        "ReadinessDecision", back_populates="decided_by_actor"
    )
