from datetime import datetime, timezone
import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.auth_tokens import OrganizationInvite
    from app.models.challenge import Challenge
    from app.models.pilot import Pilot
    from app.models.commitment import Commitment
    from app.models.challenge_hei_candidate import ChallengeHEICandidate
    from app.models.hei_capability import HEICapability
    from app.models.organization_membership import OrganizationMembership


class Organization(Base):
    """Organization Entity Model.

    Represents participating institutions (Government Departments, HEIs,
    Universities, Industry, Startups, CSR, PRI, ULB, Research Labs, etc.).
    """

    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    organization_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="Jharkhand")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE", index=True)
    status_rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
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
    memberships: Mapped[List["OrganizationMembership"]] = relationship(
        "OrganizationMembership", back_populates="organization"
    )
    invites: Mapped[List["OrganizationInvite"]] = relationship(
        "OrganizationInvite", back_populates="organization"
    )
    sourced_challenges: Mapped[List["Challenge"]] = relationship(
        "Challenge", back_populates="source_organization"
    )
    hei_capabilities: Mapped[List["HEICapability"]] = relationship(
        "HEICapability", back_populates="organization"
    )
    challenge_candidates: Mapped[List["ChallengeHEICandidate"]] = relationship(
        "ChallengeHEICandidate", back_populates="organization"
    )
    commitments: Mapped[List["Commitment"]] = relationship(
        "Commitment", back_populates="organization"
    )
    hosted_pilots: Mapped[List["Pilot"]] = relationship(
        "Pilot", back_populates="host_organization"
    )
