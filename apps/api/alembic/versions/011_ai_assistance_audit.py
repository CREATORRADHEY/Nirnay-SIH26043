"""add ai_audit_logs table for P4A AI assistance observability

Revision ID: 011_ai_assistance_audit
Revises: 010_p2_workflows
Create Date: 2026-09-13 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "011_ai_assistance_audit"
down_revision: Union[str, None] = "010_p2_workflows"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("task_type", sa.String(length=50), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="SET NULL"), nullable=True),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("prompt_version", sa.String(length=50), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("latency_ms", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_ai_audit_logs_task_type", "ai_audit_logs", ["task_type"])
    op.create_index("ix_ai_audit_logs_actor_id", "ai_audit_logs", ["actor_id"])
    op.create_index("ix_ai_audit_logs_challenge_id", "ai_audit_logs", ["challenge_id"])
    op.create_index("ix_ai_audit_logs_provider", "ai_audit_logs", ["provider"])
    op.create_index("ix_ai_audit_logs_prompt_version", "ai_audit_logs", ["prompt_version"])
    op.create_index("ix_ai_audit_logs_created_at", "ai_audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_ai_audit_logs_created_at", table_name="ai_audit_logs")
    op.drop_index("ix_ai_audit_logs_prompt_version", table_name="ai_audit_logs")
    op.drop_index("ix_ai_audit_logs_provider", table_name="ai_audit_logs")
    op.drop_index("ix_ai_audit_logs_challenge_id", table_name="ai_audit_logs")
    op.drop_index("ix_ai_audit_logs_actor_id", table_name="ai_audit_logs")
    op.drop_index("ix_ai_audit_logs_task_type", table_name="ai_audit_logs")
    op.drop_table("ai_audit_logs")
