"""Create tables

Revision ID: 5c1ac1e04c4b
Revises: 
Create Date: 2026-10-05 16:23:05.603534

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '5c1ac1e04c4b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""

    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        'users',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'department_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=True
        ),
        sa.Column(
            'name',
            sqlmodel.sql.sqltypes.AutoString(length=100),
            nullable=False
        ),
        sa.Column(
            'email',
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=False
        ),
        sa.Column(
            'password_hash',
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False
        ),
        sa.Column(
            'role',
            sa.Enum(
                'CITIZEN',
                'ORG_ADMIN',
                'DEPARTMENT_STAFF',
                'FIELD_STAFF',
                name='userrole'
            ),
            nullable=False
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    op.create_table(
        'organizations',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'admin_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'name',
            sqlmodel.sql.sqltypes.AutoString(length=150),
            nullable=False
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'departments',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'organization_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'name',
            sqlmodel.sql.sqltypes.AutoString(length=150),
            nullable=False
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_foreign_key(
        'fk_users_department_id',
        'users',
        'departments',
        ['department_id'],
        ['id']
    )

    op.create_foreign_key(
        'fk_organizations_admin_id',
        'organizations',
        'users',
        ['admin_id'],
        ['id']
    )

    op.create_foreign_key(
        'fk_departments_organization_id',
        'departments',
        'organizations',
        ['organization_id'],
        ['id']
    )

    op.create_table(
        'issue_categories',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'organization_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'department_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'name',
            sqlmodel.sql.sqltypes.AutoString(length=150),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ['department_id'],
            ['departments.id']
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'],
            ['organizations.id']
        ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'wards',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'organization_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'name',
            sqlmodel.sql.sqltypes.AutoString(length=100),
            nullable=False
        ),
        sa.Column(
            'geo_boundary',
            geoalchemy2.types.Geometry(
                geometry_type='POLYGON',
                srid=4326,
                dimension=2,
                from_text='ST_GeomFromEWKT',
                name='geometry',
                nullable=False
            ),
            nullable=False
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'],
            ['organizations.id']
        ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'issues',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'issue_number',
            sqlmodel.sql.sqltypes.AutoString(length=50),
            nullable=False
        ),
        sa.Column(
            'citizen_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'organization_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'ward_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'department_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'category_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'title',
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=False
        ),
        sa.Column(
            'description',
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False
        ),
        sa.Column(
            'latitude',
            sa.Float(),
            nullable=False
        ),
        sa.Column(
            'longitude',
            sa.Float(),
            nullable=False
        ),
        sa.Column(
            'status',
            sa.Enum(
                'REPORTED',
                'REJECTED',
                'IN_PROGRESS',
                'RESOLUTION_PENDING',
                'RESOLVED',
                name='issuestatus'
            ),
            nullable=False
        ),
        sa.Column(
            'assigned_to_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=True
        ),
        sa.Column(
            'reported_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.Column(
            'due_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=True
        ),
        sa.Column(
            'resolved_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=True
        ),
        sa.Column(
            'closed_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=True
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ['assigned_to_id'],
            ['users.id']
        ),
        sa.ForeignKeyConstraint(
            ['category_id'],
            ['issue_categories.id']
        ),
        sa.ForeignKeyConstraint(
            ['citizen_id'],
            ['users.id']
        ),
        sa.ForeignKeyConstraint(
            ['department_id'],
            ['departments.id']
        ),
        sa.ForeignKeyConstraint(
            ['organization_id'],
            ['organizations.id']
        ),
        sa.ForeignKeyConstraint(
            ['ward_id'],
            ['wards.id']
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('issue_number')
    )

    op.create_table(
        'issue_media',
        sa.Column(
            'id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'issue_id',
            sqlmodel.sql.sqltypes.AutoString(length=36),
            nullable=False
        ),
        sa.Column(
            'file_url',
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False
        ),
        sa.Column(
            'created_at',
            sqlmodel.sql.sqltypes.UTCDateTime(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ['issue_id'],
            ['issues.id']
        ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop dependent tables first.
    op.drop_table('issue_media')

    op.drop_table('issues')

    op.drop_index(
        'idx_wards_geo_boundary',
        table_name='wards',
        postgresql_using='gist'
    )

    op.drop_table('wards')
    op.drop_table('issue_categories')

    # Remove the circular foreign keys before dropping
    # the three mutually dependent tables.
    op.drop_constraint(
        'fk_departments_organization_id',
        'departments',
        type_='foreignkey'
    )

    op.drop_constraint(
        'fk_organizations_admin_id',
        'organizations',
        type_='foreignkey'
    )

    op.drop_constraint(
        'fk_users_department_id',
        'users',
        type_='foreignkey'
    )

    # Now the tables can be dropped.
    op.drop_table('departments')
    op.drop_table('organizations')
    op.drop_table('users')
