"""adicionar imagens aos anuncios

Revision ID: 3c7f5b9e21a4
Revises: 2b1adc1f82bb
Create Date: 2026-09-16 18:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "3c7f5b9e21a4"

down_revision = "2b1adc1f82bb"

branch_labels = None

depends_on = None


def upgrade():
    op.create_table(
        "anuncio_imagens",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "anuncio_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "url",
            sa.String(length=1000),
            nullable=False
        ),

        sa.Column(
            "public_id",
            sa.String(length=255),
            nullable=False
        ),

        sa.Column(
            "ordem",
            sa.Integer(),
            nullable=False,
            server_default="0"
        ),

        sa.ForeignKeyConstraint(
            ["anuncio_id"],
            ["anuncios.id"],
            ondelete="CASCADE"
        ),

        sa.PrimaryKeyConstraint(
            "id"
        )
    )


def downgrade():
    op.drop_table(
        "anuncio_imagens"
    )