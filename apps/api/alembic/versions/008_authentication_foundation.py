"""add authentication, session, tokens, and organization invite tables

Revision ID: 008_authentication_foundation
Revises: 007_pilot_outcome_foundation
Create Date: 2026-09-13 17:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "008_authentication_foundation"
down_revision: Union[str, None] = "007_pilot_outcome_foundation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Alter actors table
    op.add_column("actors", sa.Column("platform_role", sa.String(length=50), nullable=False, server_default="COMMUNITY_REPORTER"))
    op.create_index(op.f("ix_actors_platform_role"), "actors", ["platform_role"], unique=False)

    # 2. Alter organizations table
    op.add_column("organizations", sa.Column("status", sa.String(length=50), nullable=False, server_default="ACTIVE"))
    op.create_index(op.f("ix_organizations_status"), "organizations", ["status"], unique=False)

    # 3. Alter organization_memberships table
    op.add_column("organization_memberships", sa.Column("role", sa.String(length=50), nullable=False, server_default="MEMBER"))

    # 4. Create accounts table
    op.create_table(
        "accounts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="RESTRICT"), nullable=False, unique=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_accounts_actor_id"), "accounts", ["actor_id"], unique=True)
    op.create_index(op.f("ix_accounts_email"), "accounts", ["email"], unique=True)

    # 5. Create auth_sessions table
    op.create_table(
        "auth_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
    )
    op.create_index(op.f("ix_auth_sessions_actor_id"), "auth_sessions", ["actor_id"], unique=False)
    op.create_index(op.f("ix_auth_sessions_token_hash"), "auth_sessions", ["token_hash"], unique=True)
    op.create_index(op.f("ix_auth_sessions_expires_at"), "auth_sessions", ["expires_at"], unique=False)
    op.create_index(op.f("ix_auth_sessions_revoked_at"), "auth_sessions", ["revoked_at"], unique=False)

    # 6. Create email_verification_tokens table
    op.create_table(
        "email_verification_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_email_verification_tokens_actor_id"), "email_verification_tokens", ["actor_id"], unique=False)
    op.create_index(op.f("ix_email_verification_tokens_token_hash"), "email_verification_tokens", ["token_hash"], unique=True)
    op.create_index(op.f("ix_email_verification_tokens_expires_at"), "email_verification_tokens", ["expires_at"], unique=False)

    # 7. Create password_reset_tokens table
    op.create_table(
        "password_reset_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_password_reset_tokens_actor_id"), "password_reset_tokens", ["actor_id"], unique=False)
    op.create_index(op.f("ix_password_reset_tokens_token_hash"), "password_reset_tokens", ["token_hash"], unique=True)
    op.create_index(op.f("ix_password_reset_tokens_expires_at"), "password_reset_tokens", ["expires_at"], unique=False)

    # 8. Create organization_invites table
    op.create_table(
        "organization_invites",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="MEMBER"),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("invited_by_actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("actors.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_organization_invites_organization_id"), "organization_invites", ["organization_id"], unique=False)
    op.create_index(op.f("ix_organization_invites_email"), "organization_invites", ["email"], unique=False)
    op.create_index(op.f("ix_organization_invites_token_hash"), "organization_invites", ["token_hash"], unique=True)
    op.create_index(op.f("ix_organization_invites_expires_at"), "organization_invites", ["expires_at"], unique=False)


def downgrade() -> None:
    op.drop_table("organization_invites")
    op.drop_table("password_reset_tokens")
    op.drop_table("email_verification_tokens")
    op.drop_table("auth_sessions")
    op.drop_table("accounts")
    op.drop_column("organization_memberships", "role")
    op.drop_index(op.f("ix_organizations_status"), table_name="organizations")
    op.drop_column("organizations", "status")
    op.drop_index(op.f("ix_actors_platform_role"), table_name="actors")
    op.drop_column("actors", "platform_role")
