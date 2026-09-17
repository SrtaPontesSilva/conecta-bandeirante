from datetime import datetime

from ..extensions import db


class Notificacao(db.Model):
    __tablename__ = "notificacoes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False
    )

    tipo = db.Column(
        db.String(50),
        nullable=False
    )

    titulo = db.Column(
        db.String(150),
        nullable=False
    )

    mensagem = db.Column(
        db.Text,
        nullable=False
    )

    lida = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    referencia_id = db.Column(
        db.Integer,
        nullable=True
    )

    criada_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    usuario = db.relationship(
        "Usuario",
        backref=db.backref(
            "notificacoes",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )