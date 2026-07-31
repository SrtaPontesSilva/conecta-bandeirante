from datetime import datetime

from ..extensions import db


class Parceiro(db.Model):
    __tablename__ = "parceiros"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome_estabelecimento = db.Column(
        db.String(150),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        nullable=False,
        unique=True
    )

    telefone_comercial = db.Column(
        db.String(20),
        nullable=False
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