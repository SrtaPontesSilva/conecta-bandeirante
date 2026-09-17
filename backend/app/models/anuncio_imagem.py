from ..extensions import db


class AnuncioImagem(db.Model):
    __tablename__ = "anuncio_imagens"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    anuncio_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "anuncios.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    url = db.Column(
        db.String(1000),
        nullable=False
    )

    public_id = db.Column(
        db.String(255),
        nullable=False
    )

    ordem = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    anuncio = db.relationship(
        "Anuncio",
        back_populates="imagens"
    )