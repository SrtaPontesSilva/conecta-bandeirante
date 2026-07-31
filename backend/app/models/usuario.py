from datetime import datetime

from ..extensions import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    sobrenome = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        nullable=False,
        unique=True
    )

    cpf = db.Column(
        db.String(11),
        nullable=False,
        unique=True
    )

    senha_hash = db.Column(
        db.String(255),
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )