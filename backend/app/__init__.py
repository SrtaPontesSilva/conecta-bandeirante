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
    # DATABASE
    # =========================================
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace(
                "postgres://",
                "postgresql+psycopg://",
                1
            )

        elif database_url.startswith("postgresql://"):
            database_url = database_url.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1
            )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # =========================================
    # SECURITY
    # =========================================
    secret_key = os.getenv("SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "A variável de ambiente SECRET_KEY não foi configurada."
        )

    app.config["SECRET_KEY"] = secret_key
    app.config["JWT_SECRET_KEY"] = secret_key

    # =========================================
    # CORS
    # =========================================
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "https://conecta-bandeirante-2026.vercel.app",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                ]
            }
        },
        supports_credentials=True
    )

    # =========================================
    # EXTENSIONS
    # =========================================
    db.init_app(app)

    Migrate(app, db)

    jwt = JWTManager(app)

    # =========================================
    # JWT ERROR HANDLERS
    # =========================================
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            "erro": "Token inválido."
        }, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            "erro": "Token expirado."
        }, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            "erro": "Token de autenticação não enviado."
        }, 401

    # =========================================
    # MODELS
    # =========================================
    from .models import (
        Usuario,
        Parceiro,
        Anuncio,
        AnuncioDisponibilidade
    )

    # =========================================
    # ROUTES
    # =========================================
    from .routes.usuarios import usuarios_bp
    from .routes.parceiros import parceiros_bp
    from .routes.auth import auth_bp
    from .routes.anuncios import anuncios_bp

    # =========================================
    # BLUEPRINTS
    # =========================================
    # Cada blueprint já possui seu próprio
    # prefixo /api/... .
    #
    # Portanto, NÃO adicionar url_prefix aqui.
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(parceiros_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(anuncios_bp)

    # =========================================
    # HEALTH CHECK
    # =========================================
    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "message": "Conecta Bandeirante API funcionando"
        }, 200

    @app.get("/api/health/database")
    def database_health():
        try:
            db.session.execute(db.text("SELECT 1"))

            return {
                "status": "ok",
                "database": "conectado"
            }, 200

        except Exception as error:
            db.session.rollback()

            return {
                "status": "error",
                "database": "não conectado",
                "message": str(error)
            }, 500

    return app