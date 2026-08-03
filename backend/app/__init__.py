from flask import Flask

from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

import os

from .extensions import db


def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    CORS(app)

    # Inicialização do banco e das migrations
    db.init_app(app)
    Migrate(app, db)

    # Importação dos modelos
    from .models import (
        Usuario,
        Parceiro,
        Anuncio,
        AnuncioDisponibilidade
    )

    # Importação das rotas
    from .routes.usuarios import usuarios_bp
    from .routes.parceiros import parceiros_bp
    from .routes.auth import auth_bp
    from .routes.anuncios import anuncios_bp

    # Registro das rotas
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(parceiros_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(anuncios_bp)

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "message": "Conecta Bandeirante API funcionando"
        }

    @app.get("/api/health/database")
    def database_health():
        try:
            db.session.execute(db.text("SELECT 1"))

            return {
                "status": "ok",
                "database": "conectado"
            }

        except Exception as error:
            return {
                "status": "error",
                "database": "não conectado",
                "message": str(error)
            }, 500

    return app