"""001_identity_foundation

Revision ID: 001_identity_foundation
Revises:
Create Date: 2026-09-13 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_identity_foundation"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create organizations table
    op.create_table(
        "organizations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("organization_type", sa.String(length=50), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=False, server_default="Jharkhand"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organizations_district", "organizations", ["district"], unique=False)
    op.create_index("ix_organizations_is_active", "organizations", ["is_active"], unique=False)
    op.create_index("ix_organizations_organization_type", "organizations", ["organization_type"], unique=False)

    # 2. Create actors table
    op.create_table(
        "actors",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_actors_is_active", "actors", ["is_active"], unique=False)

    # 3. Create organization_memberships table
    op.create_table(
        "organization_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("organization_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("affiliation_label", sa.String(length=100), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["actors.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("actor_id", "organization_id", name="uq_actor_organization_membership"),
    )
    op.create_index("ix_organization_memberships_actor_id", "organization_memberships", ["actor_id"], unique=False)
    op.create_index("ix_organization_memberships_is_active", "organization_memberships", ["is_active"], unique=False)
    op.create_index("ix_organization_memberships_organization_id", "organization_memberships", ["organization_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_organization_memberships_organization_id", table_name="organization_memberships")
    op.drop_index("ix_organization_memberships_is_active", table_name="organization_memberships")
    op.drop_index("ix_organization_memberships_actor_id", table_name="organization_memberships")
    op.drop_table("organization_memberships")

    op.drop_index("ix_actors_is_active", table_name="actors")
    op.drop_table("actors")

    op.drop_index("ix_organizations_organization_type", table_name="organizations")
    op.drop_index("ix_organizations_is_active", table_name="organizations")
    op.drop_index("ix_organizations_district", table_name="organizations")
    op.drop_table("organizations")
