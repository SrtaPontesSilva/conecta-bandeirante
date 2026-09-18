from datetime import datetime

from ..extensions import db


class PreferenciaNotificacao(db.Model):
    __tablename__ = "preferencias_notificacoes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False,
        unique=True
    )

    # Canais
    notificacoes_push = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    notificacoes_email = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    # Tipos de eventos
    solicitacoes = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    aceitas = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    recusadas = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    reservas = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    # Retenção do histórico.
    # 0 = nunca excluir automaticamente.
    retencao_dias = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    criada_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    atualizada_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    usuario = db.relationship(
        "Usuario",
        backref=db.backref(
            "preferencia_notificacao",
            uselist=False,
            cascade="all, delete-orphan"
        )
    )
