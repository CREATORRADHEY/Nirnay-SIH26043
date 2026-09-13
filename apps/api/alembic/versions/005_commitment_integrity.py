"""add versioned commitment integrity foundation table

Revision ID: 005_commitment_integrity
Revises: 004_hei_capability_matching
Create Date: 2026-09-13 10:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "005_commitment_integrity"
down_revision: Union[str, None] = "004_hei_capability_matching"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

commitment_status_enum = sa.Enum(
    "PROPOSED",
    "OFFERED",
    "ACCEPTED",
    "DECLINED",
    "WITHDRAWN",
    "EXPIRED",
    name="commitment_status_enum",
)


def upgrade() -> None:
    # 1. Create commitments table with commitment_status_enum
    op.create_table(
        "commitments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("commitment_type", sa.String(length=50), nullable=False),
        sa.Column("status", commitment_status_enum, nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("scope_description", sa.Text(), nullable=False),
        sa.Column("recorded_by_actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("version >= 1", name="ck_commitment_version_min"),
        sa.CheckConstraint(
            "valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from",
            name="ck_commitment_validity_window",
        ),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["recorded_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "challenge_id",
            "organization_id",
            "commitment_type",
            "version",
            name="uq_commitment_challenge_org_type_version",
        ),
    )
    op.create_index(op.f("ix_commitments_challenge_id"), "commitments", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_commitments_organization_id"), "commitments", ["organization_id"], unique=False)
    op.create_index(op.f("ix_commitments_commitment_type"), "commitments", ["commitment_type"], unique=False)
    op.create_index(op.f("ix_commitments_status"), "commitments", ["status"], unique=False)
    op.create_index(op.f("ix_commitments_recorded_by_actor_id"), "commitments", ["recorded_by_actor_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_commitments_recorded_by_actor_id"), table_name="commitments")
    op.drop_index(op.f("ix_commitments_status"), table_name="commitments")
    op.drop_index(op.f("ix_commitments_commitment_type"), table_name="commitments")
    op.drop_index(op.f("ix_commitments_organization_id"), table_name="commitments")
    op.drop_index(op.f("ix_commitments_challenge_id"), table_name="commitments")
    op.drop_table("commitments")

    commitment_status_enum.drop(op.get_bind(), checkfirst=True)
