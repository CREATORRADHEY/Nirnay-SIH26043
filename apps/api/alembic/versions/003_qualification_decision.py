"""add qualification decision and history foundation tables

Revision ID: 003_qualification_decision
Revises: 002_challenge_evidence
Create Date: 2026-09-13 10:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003_qualification_decision'
down_revision: Union[str, None] = '002_challenge_evidence'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

qualification_route_enum = sa.Enum(
    'SERVICE',
    'CLARIFY',
    'RESEARCH_REVIEW',
    'INNOVATION_CHALLENGE',
    name='qualification_route_enum'
)


def upgrade() -> None:
    # 1. Create qualification_decisions table
    op.create_table(
        'qualification_decisions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('challenge_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('route', qualification_route_enum, nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('rationale', sa.Text(), nullable=False),
        sa.Column('decided_by_actor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('version >= 1', name='ck_qualification_decision_version_min'),
        sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['decided_by_actor_id'], ['actors.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('challenge_id', 'version', name='uq_qualification_decision_challenge_version')
    )
    op.create_index(op.f('ix_qualification_decisions_challenge_id'), 'qualification_decisions', ['challenge_id'], unique=False)
    op.create_index(op.f('ix_qualification_decisions_decided_by_actor_id'), 'qualification_decisions', ['decided_by_actor_id'], unique=False)
    op.create_index(op.f('ix_qualification_decisions_route'), 'qualification_decisions', ['route'], unique=False)

    # 2. Create qualification_decision_evidence association table
    op.create_table(
        'qualification_decision_evidence',
        sa.Column('qualification_decision_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('evidence_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['evidence_id'], ['evidences.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['qualification_decision_id'], ['qualification_decisions.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('qualification_decision_id', 'evidence_id')
    )


def downgrade() -> None:
    op.drop_table('qualification_decision_evidence')

    op.drop_index(op.f('ix_qualification_decisions_route'), table_name='qualification_decisions')
    op.drop_index(op.f('ix_qualification_decisions_decided_by_actor_id'), table_name='qualification_decisions')
    op.drop_index(op.f('ix_qualification_decisions_challenge_id'), table_name='qualification_decisions')
    op.drop_table('qualification_decisions')

    qualification_route_enum.drop(op.get_bind(), checkfirst=True)
