content = """\"\"\"012_p4b_governance_admin

Revision ID: 012_p4b_governance_admin
Revises: 011_ai_assistance_audit
Create Date: 2026-09-13 20:18:00.000000

\"\"\"
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '012_p4b_governance_admin'
down_revision: Union[str, None] = '011_ai_assistance_audit'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('organizations', sa.Column('status_rationale', sa.Text(), nullable=True))
    op.add_column('organizations', sa.Column('status_updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'status_updated_at')
    op.drop_column('organizations', 'status_rationale')
"""

with open("apps/api/alembic/versions/012_p4b_governance_admin.py", "w") as f:
    f.write(content)

print("Migration 012_p4b_governance_admin created")
