from flask import Flask

from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

import os

from .extensions import db


def create_app():
    load_dotenv()

    app = Flask(__name__)

    # =========================================
    # CONFIGURAÇÃO DO BANCO DE DADOS
    # =========================================

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # =========================================
    # CONFIGURAÇÃO DE SEGURANÇA
    # =========================================

    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY"
    )

    app.config["JWT_SECRET_KEY"] = os.getenv(
        "SECRET_KEY"
    )

    # =========================================
    # CONFIGURAÇÃO DO CORS
    # =========================================

    CORS(app)

    # =========================================
    # INICIALIZAÇÃO DO BANCO E MIGRATIONS
    # =========================================

    db.init_app(app)

    Migrate(app, db)

    # =========================================
    # INICIALIZAÇÃO DO JWT
    # =========================================

    JWTManager(app)

    # =========================================
    # IMPORTAÇÃO DOS MODELOS
    # =========================================

    from .models import (
        Usuario,
        Parceiro,
        Anuncio,
        AnuncioDisponibilidade
    )

    # =========================================
    # IMPORTAÇÃO DAS ROTAS
    # =========================================

    from .routes.usuarios import usuarios_bp
    from .routes.parceiros import parceiros_bp
    from .routes.auth import auth_bp
    from .routes.anuncios import anuncios_bp

    # =========================================
    # REGISTRO DAS ROTAS
    # =========================================

    app.register_blueprint(usuarios_bp)
    app.register_blueprint(parceiros_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(anuncios_bp)

    # =========================================
    # HEALTH CHECK DA API
    # =========================================

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "message": "Conecta Bandeirante API funcionando"
        }

    # =========================================
    # HEALTH CHECK DO BANCO
    # =========================================

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