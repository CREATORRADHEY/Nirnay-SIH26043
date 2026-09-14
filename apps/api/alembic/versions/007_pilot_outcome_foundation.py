"""add pilot evidence plan and outcome foundation tables

Revision ID: 007_pilot_outcome_foundation
Revises: 006_readiness_integrity
Create Date: 2026-09-13 11:12:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "007_pilot_outcome_foundation"
down_revision: Union[str, None] = "006_readiness_integrity"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

operational_status_enum = sa.Enum(
    "PLANNED",
    "ACTIVE",
    "COMPLETED",
    "STOPPED",
    name="operational_status_enum",
)

evidence_conclusion_enum = sa.Enum(
    "NOT_REVIEWED",
    "VALIDATED",
    "ITERATE",
    "INCONCLUSIVE",
    name="evidence_conclusion_enum",
)


def upgrade() -> None:
    # 1. Create pilots table
    op.create_table(
        "pilots",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("authorized_by_readiness_decision_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("host_organization_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("site_description", sa.Text(), nullable=True),
        sa.Column("planned_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("planned_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("planned_end IS NULL OR planned_start IS NULL OR planned_end >= planned_start", name="ck_pilot_planned_dates_valid"),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["authorized_by_readiness_decision_id"], ["readiness_decisions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["host_organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_pilots_challenge_id"), "pilots", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_pilots_authorized_by_readiness_decision_id"), "pilots", ["authorized_by_readiness_decision_id"], unique=False)
    op.create_index(op.f("ix_pilots_host_organization_id"), "pilots", ["host_organization_id"], unique=False)
    op.create_index(op.f("ix_pilots_created_by_actor_id"), "pilots", ["created_by_actor_id"], unique=False)

    # 2. Create pilot_operational_states table
    op.create_table(
        "pilot_operational_states",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pilot_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", operational_status_enum, nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("recorded_by_actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("version >= 1", name="ck_pilot_operational_state_version_min"),
        sa.ForeignKeyConstraint(["pilot_id"], ["pilots.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["recorded_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pilot_id", "version", name="uq_pilot_operational_state_pilot_version"),
    )
    op.create_index(op.f("ix_pilot_operational_states_pilot_id"), "pilot_operational_states", ["pilot_id"], unique=False)
    op.create_index(op.f("ix_pilot_operational_states_status"), "pilot_operational_states", ["status"], unique=False)
    op.create_index(op.f("ix_pilot_operational_states_recorded_by_actor_id"), "pilot_operational_states", ["recorded_by_actor_id"], unique=False)

    # 3. Create pilot_evidence_plans table
    op.create_table(
        "pilot_evidence_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pilot_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("objective", sa.Text(), nullable=False),
        sa.Column("primary_metric", sa.String(length=255), nullable=False),
        sa.Column("baseline_definition", sa.Text(), nullable=False),
        sa.Column("denominator_definition", sa.Text(), nullable=False),
        sa.Column("data_collection_method", sa.Text(), nullable=False),
        sa.Column("evaluation_window", sa.Text(), nullable=True),
        sa.Column("success_criteria", sa.Text(), nullable=True),
        sa.Column("limitations", sa.Text(), nullable=True),
        sa.Column("created_by_actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("version >= 1", name="ck_pilot_evidence_plan_version_min"),
        sa.ForeignKeyConstraint(["pilot_id"], ["pilots.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pilot_id", "version", name="uq_pilot_evidence_plan_pilot_version"),
    )
    op.create_index(op.f("ix_pilot_evidence_plans_pilot_id"), "pilot_evidence_plans", ["pilot_id"], unique=False)
    op.create_index(op.f("ix_pilot_evidence_plans_created_by_actor_id"), "pilot_evidence_plans", ["created_by_actor_id"], unique=False)

    # 4. Create outcome_assessments table
    op.create_table(
        "outcome_assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pilot_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("evidence_plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("conclusion", evidence_conclusion_enum, nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("limitations", sa.Text(), nullable=True),
        sa.Column("assessed_by_actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("assessed_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("version >= 1", name="ck_outcome_assessment_version_min"),
        sa.CheckConstraint(
            "conclusion = 'NOT_REVIEWED' OR assessed_by_actor_id IS NOT NULL",
            name="ck_outcome_assessment_human_actor",
        ),
        sa.ForeignKeyConstraint(["pilot_id"], ["pilots.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["evidence_plan_id"], ["pilot_evidence_plans.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["assessed_by_actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pilot_id", "version", name="uq_outcome_assessment_pilot_version"),
    )
    op.create_index(op.f("ix_outcome_assessments_pilot_id"), "outcome_assessments", ["pilot_id"], unique=False)
    op.create_index(op.f("ix_outcome_assessments_evidence_plan_id"), "outcome_assessments", ["evidence_plan_id"], unique=False)
    op.create_index(op.f("ix_outcome_assessments_conclusion"), "outcome_assessments", ["conclusion"], unique=False)
    op.create_index(op.f("ix_outcome_assessments_assessed_by_actor_id"), "outcome_assessments", ["assessed_by_actor_id"], unique=False)

    # 5. Create outcome_assessment_evidence association table
    op.create_table(
        "outcome_assessment_evidence",
        sa.Column("outcome_assessment_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("evidence_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["evidence_id"], ["evidences.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["outcome_assessment_id"], ["outcome_assessments.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("outcome_assessment_id", "evidence_id"),
    )


def downgrade() -> None:
    op.drop_table("outcome_assessment_evidence")

    op.drop_index(op.f("ix_outcome_assessments_assessed_by_actor_id"), table_name="outcome_assessments")
    op.drop_index(op.f("ix_outcome_assessments_conclusion"), table_name="outcome_assessments")
    op.drop_index(op.f("ix_outcome_assessments_evidence_plan_id"), table_name="outcome_assessments")
    op.drop_index(op.f("ix_outcome_assessments_pilot_id"), table_name="outcome_assessments")
    op.drop_table("outcome_assessments")

    op.drop_index(op.f("ix_pilot_evidence_plans_created_by_actor_id"), table_name="pilot_evidence_plans")
    op.drop_index(op.f("ix_pilot_evidence_plans_pilot_id"), table_name="pilot_evidence_plans")
    op.drop_table("pilot_evidence_plans")

    op.drop_index(op.f("ix_pilot_operational_states_recorded_by_actor_id"), table_name="pilot_operational_states")
    op.drop_index(op.f("ix_pilot_operational_states_status"), table_name="pilot_operational_states")
    op.drop_index(op.f("ix_pilot_operational_states_pilot_id"), table_name="pilot_operational_states")
    op.drop_table("pilot_operational_states")

    op.drop_index(op.f("ix_pilots_created_by_actor_id"), table_name="pilots")
    op.drop_index(op.f("ix_pilots_host_organization_id"), table_name="pilots")
    op.drop_index(op.f("ix_pilots_authorized_by_readiness_decision_id"), table_name="pilots")
    op.drop_index(op.f("ix_pilots_challenge_id"), table_name="pilots")
    op.drop_table("pilots")

    evidence_conclusion_enum.drop(op.get_bind(), checkfirst=True)
    operational_status_enum.drop(op.get_bind(), checkfirst=True)
