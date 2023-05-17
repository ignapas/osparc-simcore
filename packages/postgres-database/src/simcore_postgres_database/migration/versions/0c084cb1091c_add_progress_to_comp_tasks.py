"""add progress to comp_tasks

Revision ID: 0c084cb1091c
Revises: 432aa859098b
Create Date: 2023-05-05 08:00:18.951040+00:00

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0c084cb1091c"
down_revision = "432aa859098b"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "comp_tasks",
        sa.Column("progress", sa.Numeric(precision=3, scale=2), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("comp_tasks", "progress")
    # ### end Alembic commands ###
