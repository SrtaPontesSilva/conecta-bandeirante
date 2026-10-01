from datetime import datetime

from ..extensions import db


class Cupom(db.Model):
    __tablename__ = "cupons"

    # ============================================================
    # IDENTIFICAÇÃO
    # ============================================================

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # ============================================================
    # PARCEIRO
    # ============================================================

    parceiro_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "parceiros.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    # ============================================================
    # INFORMAÇÕES DO CUPOM
    # ============================================================

    titulo = db.Column(
        db.String(150),
        nullable=False
    )

    descricao = db.Column(
        db.Text,
        nullable=False
    )

    categoria = db.Column(
        db.String(80),
        nullable=False
    )

    # ============================================================
    # IMAGEM
    # ============================================================

    imagem_url = db.Column(
        db.String(500),
        nullable=True
    )

    imagem_public_id = db.Column(
        db.String(500),
        nullable=True
    )

    # ============================================================
    # RESGATE
    # ============================================================

    pontos = db.Column(
        db.Integer,
        nullable=False
    )

    limite_resgates = db.Column(
        db.Integer,
        nullable=True
    )

    # ============================================================
    # VALIDADE
    # ============================================================

    validade_inicio = db.Column(
        db.DateTime,
        nullable=False
    )

    validade_fim = db.Column(
        db.DateTime,
        nullable=False
    )

    # ============================================================
    # REGRAS
    # ============================================================

    regras = db.Column(
        db.Text,
        nullable=True
    )

    # ============================================================
    # STATUS
    # ============================================================

    ativo = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
        index=True
    )

    # ============================================================
    # DATAS DE CONTROLE
    # ============================================================

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    atualizado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # ============================================================
    # RELACIONAMENTO
    # ============================================================

    parceiro = db.relationship(
        "Parceiro",
        back_populates="cupons"
    )

    # ============================================================
    # REPRESENTAÇÃO
    # ============================================================

    def __repr__(self):
        return (
            f"<Cupom "
            f"id={self.id} "
            f"titulo={self.titulo!r} "
            f"parceiro_id={self.parceiro_id}>"
        )