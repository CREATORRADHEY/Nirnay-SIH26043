"""add clarification and notifications tables for P2

Revision ID: 010_p2_workflows
Revises: 009_auth_security_hardening
Create Date: 2026-09-13 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "010_p2_workflows"
down_revision: Union[str, None] = "009_auth_security_hardening"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clarification_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("challenge_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("requested_by_actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="OPEN"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f("ix_clarification_requests_challenge_id"), "clarification_requests", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_clarification_requests_requested_by_actor_id"), "clarification_requests", ["requested_by_actor_id"], unique=False)
    op.create_index(op.f("ix_clarification_requests_status"), "clarification_requests", ["status"], unique=False)

    op.create_table(
        "clarification_responses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clarification_requests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("response", sa.Text(), nullable=False),
        sa.Column("responded_by_actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_clarification_responses_request_id"), "clarification_responses", ["request_id"], unique=False)
    op.create_index(op.f("ix_clarification_responses_responded_by_actor_id"), "clarification_responses", ["responded_by_actor_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("recipient_actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("resource_type", sa.String(length=64), nullable=True),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f("ix_notifications_recipient_actor_id"), "notifications", ["recipient_actor_id"], unique=False)
    op.create_index(op.f("ix_notifications_type"), "notifications", ["type"], unique=False)
    op.create_index(op.f("ix_notifications_created_at"), "notifications", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("clarification_responses")
    op.drop_table("clarification_requests")
