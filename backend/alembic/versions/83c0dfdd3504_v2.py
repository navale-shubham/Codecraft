"""v2

Revision ID: 83c0dfdd3504
Revises: 5258a412b1ad
Create Date: 2026-10-17 13:17:06.245189

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '83c0dfdd3504'
down_revision: Union[str, Sequence[str], None] = '5258a412b1ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_unique_constraint('uq_issue_categories_name', 'issue_categories', ['name'])
    op.add_column('issue_media', sa.Column('type', sa.Enum('QUERY', 'RESOLUTION', name='mediatype'), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    
    op.drop_column('issue_media', 'type')
    op.drop_constraint('uq_issue_categories_name', 'issue_categories', type_='unique')
