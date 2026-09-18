from datetime import datetime

from ..extensions import db


class PushSubscription(db.Model):
    __tablename__ = "push_subscriptions"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False
    )

    endpoint = db.Column(
        db.Text,
        nullable=False,
        unique=True
    )

    p256dh = db.Column(
        db.Text,
        nullable=False
    )

    auth = db.Column(
        db.Text,
        nullable=False
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
            "push_subscriptions",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )
