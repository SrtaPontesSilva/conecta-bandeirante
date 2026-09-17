from datetime import datetime

from ..extensions import db


class Solicitacao(db.Model):
    __tablename__ = "solicitacoes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    anuncio_id = db.Column(
        db.Integer,
        db.ForeignKey("anuncios.id"),
        nullable=False
    )

    interessado_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False
    )

    disponibilidade_id = db.Column(
        db.Integer,
        db.ForeignKey("anuncio_disponibilidades.id"),
        nullable=False
    )

    tipo = db.Column(
        db.String(20),
        nullable=False,
        default="doacao"
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pendente"
    )

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

    anuncio = db.relationship(
        "Anuncio",
        backref=db.backref(
            "solicitacoes",
            lazy=True
        )
    )

    interessado = db.relationship(
        "Usuario",
        backref=db.backref(
            "solicitacoes_enviadas",
            lazy=True
        )
    )

    disponibilidade = db.relationship(
        "AnuncioDisponibilidade",
        backref=db.backref(
            "solicitacoes",
            lazy=True
        )
    )