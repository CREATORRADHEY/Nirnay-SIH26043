"""add challenge and evidence foundation tables

Revision ID: 002_challenge_evidence
Revises: 001_identity_foundation
Create Date: 2026-09-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_challenge_evidence'
down_revision: Union[str, None] = '001_identity_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create challenges table
    op.create_table(
        'challenges',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('domain', sa.String(length=100), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('district', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), server_default='Jharkhand', nullable=False),
        sa.Column('submitted_by_actor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('source_organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['submitted_by_actor_id'], ['actors.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['source_organization_id'], ['organizations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_challenges_domain'), 'challenges', ['domain'], unique=False)
    op.create_index(op.f('ix_challenges_source_type'), 'challenges', ['source_type'], unique=False)
    op.create_index(op.f('ix_challenges_district'), 'challenges', ['district'], unique=False)
    op.create_index(op.f('ix_challenges_submitted_by_actor_id'), 'challenges', ['submitted_by_actor_id'], unique=False)
    op.create_index(op.f('ix_challenges_source_organization_id'), 'challenges', ['source_organization_id'], unique=False)

    # 2. Create evidences table
    op.create_table(
        'evidences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('challenge_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('submitted_by_actor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('evidence_type', sa.String(length=50), nullable=False),
        sa.Column('storage_reference', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('captured_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['submitted_by_actor_id'], ['actors.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidences_challenge_id'), 'evidences', ['challenge_id'], unique=False)
    op.create_index(op.f('ix_evidences_submitted_by_actor_id'), 'evidences', ['submitted_by_actor_id'], unique=False)
    op.create_index(op.f('ix_evidences_evidence_type'), 'evidences', ['evidence_type'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evidences_evidence_type'), table_name='evidences')
    op.drop_index(op.f('ix_evidences_submitted_by_actor_id'), table_name='evidences')
    op.drop_index(op.f('ix_evidences_challenge_id'), table_name='evidences')
    op.drop_table('evidences')

    op.drop_index(op.f('ix_challenges_source_organization_id'), table_name='challenges')
    op.drop_index(op.f('ix_challenges_submitted_by_actor_id'), table_name='challenges')
    op.drop_index(op.f('ix_challenges_district'), table_name='challenges')
    op.drop_index(op.f('ix_challenges_source_type'), table_name='challenges')
    op.drop_index(op.f('ix_challenges_domain'), table_name='challenges')
    op.drop_table('challenges')
