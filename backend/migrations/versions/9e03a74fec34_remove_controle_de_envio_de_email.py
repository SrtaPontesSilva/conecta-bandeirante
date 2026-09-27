"""remove controle de envio de email

Revision ID: 9e03a74fec34
Revises: 77df1584d732
Create Date: 2026-09-27 11:58:20.666107

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9e03a74fec34"
down_revision = "77df1584d732"
branch_labels = None
depends_on = None


def upgrade():
    # Adiciona a coluna com valor padrão temporário.
    #
    # Isso permite preencher os registros existentes
    # sem violar a restrição NOT NULL.
    with op.batch_alter_table(
        "notificacoes",
        schema=None
    ) as batch_op:
        batch_op.add_column(
            sa.Column(
                "push_enviado",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false()
            )
        )

    # Remove o valor padrão do banco depois que
    # os registros existentes já foram preenchidos.
    with op.batch_alter_table(
        "notificacoes",
        schema=None
    ) as batch_op:
        batch_op.alter_column(
            "push_enviado",
            server_default=None
        )


def downgrade():
    with op.batch_alter_table(
        "notificacoes",
        schema=None
    ) as batch_op:
        batch_op.drop_column("push_enviado")