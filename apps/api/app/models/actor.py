from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.account import Account
    from app.models.auth_session import AuthSession
    from app.models.challenge import Challenge
    from app.models.pilot import Pilot
    from app.models.pilot_operational_state import PilotOperationalState
    from app.models.pilot_evidence_plan import PilotEvidencePlan
    from app.models.outcome_assessment import OutcomeAssessment
    from app.models.readiness_condition import ReadinessCondition
    from app.models.readiness_decision import ReadinessDecision
    from app.models.commitment import Commitment
    from app.models.challenge_hei_candidate import ChallengeHEICandidate
    from app.models.evidence import Evidence
    from app.models.organization_membership import OrganizationMembership
    from app.models.qualification_decision import QualificationDecision


class Actor(Base):
    """Actor Entity Model.

    Represents a known platform participant for identity attribution, RBAC, and audit records.
    Does NOT store authentication credentials or emails (managed by Account model).
    """

    __tablename__ = "actors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    platform_role: Mapped[str] = mapped_column(
        String(50), nullable=False, default="COMMUNITY_REPORTER", index=True
    )
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

    # Relationships
    account: Mapped[Optional["Account"]] = relationship("Account", back_populates="actor", uselist=False)
    sessions: Mapped[List["AuthSession"]] = relationship("AuthSession", back_populates="actor")
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
    created_pilots: Mapped[List["Pilot"]] = relationship(
        "Pilot", back_populates="created_by_actor"
    )
    pilot_operational_states_recorded: Mapped[List["PilotOperationalState"]] = relationship(
        "PilotOperationalState", back_populates="recorded_by_actor"
    )
    evidence_plans_created: Mapped[List["PilotEvidencePlan"]] = relationship(
        "PilotEvidencePlan", back_populates="created_by_actor"
    )
    outcome_assessments_made: Mapped[List["OutcomeAssessment"]] = relationship(
        "OutcomeAssessment", back_populates="assessed_by_actor"
    )


