"""adiciona preferencias e push subscriptions

Revision ID: a91e7d4c62f0
Revises: 4bb702221db5
Create Date: 2026-09-17 00:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "a91e7d4c62f0"
down_revision = "4bb702221db5"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "preferencias_notificacoes",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "usuario_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "notificacoes_push",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "notificacoes_email",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "solicitacoes",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "aceitas",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "recusadas",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "reservas",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
        sa.Column(
            "retencao_dias",
            sa.Integer(),
            nullable=False,
            server_default="0"
        ),
        sa.Column(
            "criada_em",
            sa.DateTime(),
            nullable=False
        ),
        sa.Column(
            "atualizada_em",
            sa.DateTime(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"]
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "usuario_id"
        )
    )

    op.create_table(
        "push_subscriptions",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "usuario_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "endpoint",
            sa.Text(),
            nullable=False
        ),
        sa.Column(
            "p256dh",
            sa.Text(),
            nullable=False
        ),
        sa.Column(
            "auth",
            sa.Text(),
            nullable=False
        ),
        sa.Column(
            "criada_em",
            sa.DateTime(),
            nullable=False
        ),
        sa.Column(
            "atualizada_em",
            sa.DateTime(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["usuario_id"],
            ["usuarios.id"]
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "endpoint"
        )
    )


def downgrade():

    op.drop_table(
        "push_subscriptions"
    )

    op.drop_table(
        "preferencias_notificacoes"
    )
