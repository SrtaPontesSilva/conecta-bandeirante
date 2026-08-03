from datetime import datetime

from ..extensions import db


class Anuncio(db.Model):
    __tablename__ = "anuncios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

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

    modalidade = db.Column(
        db.String(20),
        nullable=False
    )

    condicao = db.Column(
        db.String(30),
        nullable=False
    )

    preco = db.Column(
        db.Numeric(10, 2),
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="disponivel"
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False
    )

    criado_em = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    disponibilidades = db.relationship(
        "AnuncioDisponibilidade",
        backref="anuncio",
        cascade="all, delete-orphan",
        lazy=True
    )


class AnuncioDisponibilidade(db.Model):
    __tablename__ = "anuncio_disponibilidades"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    anuncio_id = db.Column(
        db.Integer,
        db.ForeignKey("anuncios.id"),
        nullable=False
    )

    data = db.Column(
        db.Date,
        nullable=False
    )