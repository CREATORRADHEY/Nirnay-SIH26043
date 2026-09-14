"""add HEI capability and candidate matching foundation tables

Revision ID: 004_hei_capability_matching
Revises: 003_qualification_decision
Create Date: 2026-09-13 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "004_hei_capability_matching"
down_revision: Union[str, None] = "003_qualification_decision"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create hei_capabilities table
    op.create_table(
        "hei_capabilities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("capability_type", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("discipline", sa.String(length=150), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_hei_capabilities_organization_id"), "hei_capabilities", ["organization_id"], unique=False)
    op.create_index(op.f("ix_hei_capabilities_capability_type"), "hei_capabilities", ["capability_type"], unique=False)
    op.create_index(op.f("ix_hei_capabilities_discipline"), "hei_capabilities", ["discipline"], unique=False)
    op.create_index(op.f("ix_hei_capabilities_is_active"), "hei_capabilities", ["is_active"], unique=False)

    # 2. Create challenge_hei_candidates table
    op.create_table(
        "challenge_hei_candidates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("match_method", sa.String(length=50), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("created_by_actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("challenge_id", "organization_id", name="uq_challenge_hei_candidate"),
    )
    op.create_index(op.f("ix_challenge_hei_candidates_challenge_id"), "challenge_hei_candidates", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_challenge_hei_candidates_organization_id"), "challenge_hei_candidates", ["organization_id"], unique=False)
    op.create_index(op.f("ix_challenge_hei_candidates_match_method"), "challenge_hei_candidates", ["match_method"], unique=False)
    op.create_index(op.f("ix_challenge_hei_candidates_created_by_actor_id"), "challenge_hei_candidates", ["created_by_actor_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_challenge_hei_candidates_created_by_actor_id"), table_name="challenge_hei_candidates")
    op.drop_index(op.f("ix_challenge_hei_candidates_match_method"), table_name="challenge_hei_candidates")
    op.drop_index(op.f("ix_challenge_hei_candidates_organization_id"), table_name="challenge_hei_candidates")
    op.drop_index(op.f("ix_challenge_hei_candidates_challenge_id"), table_name="challenge_hei_candidates")
    op.drop_table("challenge_hei_candidates")

    op.drop_index(op.f("ix_hei_capabilities_is_active"), table_name="hei_capabilities")
    op.drop_index(op.f("ix_hei_capabilities_discipline"), table_name="hei_capabilities")
    op.drop_index(op.f("ix_hei_capabilities_capability_type"), table_name="hei_capabilities")
    op.drop_index(op.f("ix_hei_capabilities_organization_id"), table_name="hei_capabilities")
    op.drop_table("hei_capabilities")
