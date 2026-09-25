"""013_decision_assurance

Revision ID: 013_decision_assurance
Revises: 012_p4b_governance_admin
Create Date: 2026-09-25 22:37:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '013_decision_assurance'
down_revision: Union[str, None] = '012_p4b_governance_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'decision_assurance_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('challenge_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('challenges.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('decision_type', sa.Text(), nullable=False),
        sa.Column('authoritative_decision_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reviewer_actor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('actors.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('reviewer_organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='RESTRICT'), nullable=True),
        sa.Column('rubric_version', sa.Text(), nullable=False, server_default='v1'),
        sa.Column('rubric_answers', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('evidence_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('rationale', sa.Text(), nullable=False),
        sa.Column('limitations_note', sa.Text(), nullable=True),
        sa.Column('ai_advisory_snapshot', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_agreement_status', sa.Text(), nullable=False, server_default='NOT_APPLICABLE'),
        sa.Column('conflict_declared', sa.Text(), nullable=False, server_default='NO_KNOWN_CONFLICT'),
        sa.Column('second_review_required', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('second_review_reason', sa.Text(), nullable=True),
        sa.Column('review_status', sa.Text(), nullable=False, server_default='SINGLE_REVIEWED'),
        sa.Column('second_reviewer_actor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('actors.id', ondelete='RESTRICT'), nullable=True),
        sa.Column('second_review_rationale', sa.Text(), nullable=True),
        sa.Column('second_review_decision', sa.Text(), nullable=True),
        sa.Column('disagreement_resolved_by_actor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('actors.id', ondelete='RESTRICT'), nullable=True),
        sa.Column('resolution_rationale', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('superseded_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_decision_assurance_records_challenge_id', 'decision_assurance_records', ['challenge_id'])
    op.create_index('ix_decision_assurance_records_decision_type', 'decision_assurance_records', ['decision_type'])
    op.create_index('ix_decision_assurance_records_authoritative_decision_id', 'decision_assurance_records', ['authoritative_decision_id'])
    op.create_index('ix_decision_assurance_records_reviewer_actor_id', 'decision_assurance_records', ['reviewer_actor_id'])

    op.create_table(
        'decision_review_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('challenge_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('challenges.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('assurance_record_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('decision_assurance_records.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('requested_by_actor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('actors.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('evidence_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('evidences.id', ondelete='RESTRICT'), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_decision_review_requests_challenge_id', 'decision_review_requests', ['challenge_id'])
    op.create_index('ix_decision_review_requests_assurance_record_id', 'decision_review_requests', ['assurance_record_id'])
    op.create_index('ix_decision_review_requests_requested_by_actor_id', 'decision_review_requests', ['requested_by_actor_id'])


def downgrade() -> None:
    op.drop_table('decision_review_requests')
    op.drop_table('decision_assurance_records')
