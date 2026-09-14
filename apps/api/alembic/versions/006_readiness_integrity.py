"""add readiness conditions and dependency integrity foundation tables

Revision ID: 006_readiness_integrity
Revises: 005_commitment_integrity
Create Date: 2026-09-13 10:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "006_readiness_integrity"
down_revision: Union[str, None] = "005_commitment_integrity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

condition_status_enum = sa.Enum(
    "SATISFIED",
    "UNSATISFIED",
    "UNKNOWN",
    "DISPUTED",
    "EXPIRED",
    name="condition_status_enum",
)

readiness_status_enum = sa.Enum(
    "BLOCKED",
    "REVIEW_READY",
    "PILOT_READY",
    "REVIEW_REQUIRED",
    name="readiness_status_enum",
)


def upgrade() -> None:
    # 1. Create readiness_conditions table
    op.create_table(
        "readiness_conditions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("condition_key", sa.String(length=100), nullable=False),
        sa.Column("status", condition_status_enum, nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("assessed_by_actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("assessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("version >= 1", name="ck_readiness_condition_version_min"),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["assessed_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "challenge_id",
            "condition_key",
            "version",
            name="uq_readiness_condition_challenge_key_version",
        ),
    )
    op.create_index(op.f("ix_readiness_conditions_challenge_id"), "readiness_conditions", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_readiness_conditions_condition_key"), "readiness_conditions", ["condition_key"], unique=False)
    op.create_index(op.f("ix_readiness_conditions_status"), "readiness_conditions", ["status"], unique=False)
    op.create_index(op.f("ix_readiness_conditions_assessed_by_actor_id"), "readiness_conditions", ["assessed_by_actor_id"], unique=False)

    # 2. Create readiness_condition_commitment_dependencies association table
    op.create_table(
        "readiness_condition_commitment_dependencies",
        sa.Column("readiness_condition_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("commitment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["commitment_id"], ["commitments.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["readiness_condition_id"], ["readiness_conditions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("readiness_condition_id", "commitment_id"),
    )

    # 3. Create readiness_decisions table
    op.create_table(
        "readiness_decisions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", readiness_status_enum, nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("decided_by_actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("triggered_by_commitment_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.CheckConstraint("version >= 1", name="ck_readiness_decision_version_min"),
        sa.CheckConstraint(
            "status != 'PILOT_READY' OR decided_by_actor_id IS NOT NULL",
            name="ck_readiness_decision_pilot_ready_human_actor",
        ),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["decided_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["triggered_by_commitment_id"], ["commitments.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("challenge_id", "version", name="uq_readiness_decision_challenge_version"),
    )
    op.create_index(op.f("ix_readiness_decisions_challenge_id"), "readiness_decisions", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_readiness_decisions_status"), "readiness_decisions", ["status"], unique=False)
    op.create_index(op.f("ix_readiness_decisions_decided_by_actor_id"), "readiness_decisions", ["decided_by_actor_id"], unique=False)
    op.create_index(op.f("ix_readiness_decisions_triggered_by_commitment_id"), "readiness_decisions", ["triggered_by_commitment_id"], unique=False)

    # 4. Create readiness_decision_conditions association table
    op.create_table(
        "readiness_decision_conditions",
        sa.Column("readiness_decision_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("readiness_condition_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["readiness_condition_id"], ["readiness_conditions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["readiness_decision_id"], ["readiness_decisions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("readiness_decision_id", "readiness_condition_id"),
    )


def downgrade() -> None:
    op.drop_table("readiness_decision_conditions")

    op.drop_index(op.f("ix_readiness_decisions_triggered_by_commitment_id"), table_name="readiness_decisions")
    op.drop_index(op.f("ix_readiness_decisions_decided_by_actor_id"), table_name="readiness_decisions")
    op.drop_index(op.f("ix_readiness_decisions_status"), table_name="readiness_decisions")
    op.drop_index(op.f("ix_readiness_decisions_challenge_id"), table_name="readiness_decisions")
    op.drop_table("readiness_decisions")

    op.drop_table("readiness_condition_commitment_dependencies")

    op.drop_index(op.f("ix_readiness_conditions_assessed_by_actor_id"), table_name="readiness_conditions")
    op.drop_index(op.f("ix_readiness_conditions_status"), table_name="readiness_conditions")
    op.drop_index(op.f("ix_readiness_conditions_condition_key"), table_name="readiness_conditions")
    op.drop_index(op.f("ix_readiness_conditions_challenge_id"), table_name="readiness_conditions")
    op.drop_table("readiness_conditions")

    readiness_status_enum.drop(op.get_bind(), checkfirst=True)
    condition_status_enum.drop(op.get_bind(), checkfirst=True)
