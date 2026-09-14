"""add security_audit_logs table

Revision ID: 009_auth_security_hardening
Revises: 008_authentication_foundation
Create Date: 2026-09-13 17:17:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "009_auth_security_hardening"
down_revision: Union[str, None] = "008_authentication_foundation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "security_audit_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("actor_id", sa.String(length=36), nullable=True),
        sa.Column("account_id", sa.String(length=36), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=256), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_security_audit_logs_event_type"), "security_audit_logs", ["event_type"], unique=False)
    op.create_index(op.f("ix_security_audit_logs_actor_id"), "security_audit_logs", ["actor_id"], unique=False)
    op.create_index(op.f("ix_security_audit_logs_account_id"), "security_audit_logs", ["account_id"], unique=False)


def downgrade() -> None:
    op.drop_table("security_audit_logs")
