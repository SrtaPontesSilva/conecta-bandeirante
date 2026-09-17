from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

import cloudinary
import os

from .extensions import db


def create_app():
    load_dotenv()

    app = Flask(__name__)

    # =========================================
    # PRÉ-FLIGHT / OPTIONS
    # =========================================

    # O navegador envia uma requisição OPTIONS
    # antes de determinadas requisições, como o
    # POST com FormData + Authorization.
    #
    # Essa requisição não deve exigir JWT.
    @app.before_request
    def permitir_preflight():
        if request.method == "OPTIONS":
            return "", 204

    # =========================================
    # BANCO DE DADOS
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
    # LIMITE DE UPLOAD
    # =========================================

    # Até 25 MB por requisição.
    #
    # O frontend permite até 5 imagens.
    # O backend limita cada imagem individualmente
    # a 4 MB.
    app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024

    # =========================================
    # SEGURANÇA
    # =========================================

    app.config["SECRET_KEY"] = os.getenv(
        "SECRET_KEY"
    )

    app.config["JWT_SECRET_KEY"] = os.getenv(
        "SECRET_KEY"
    )

    # =========================================
    # CLOUDINARY
    # =========================================

    cloudinary.config(
        cloud_name=os.getenv(
            "CLOUDINARY_CLOUD_NAME"
        ),
        api_key=os.getenv(
            "CLOUDINARY_API_KEY"
        ),
        api_secret=os.getenv(
            "CLOUDINARY_API_SECRET"
        ),
        secure=True
    )

    # =========================================
    # CORS
    # =========================================

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                ]
            }
        },
        supports_credentials=True,
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allow_headers=[
            "Content-Type",
            "Authorization"
        ]
    )

    # =========================================
    # EXTENSÕES
    # =========================================

    db.init_app(app)

    Migrate(
        app,
        db
    )

    jwt = JWTManager(app)

    # =========================================
    # ERROS JWT
    # =========================================

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "erro": "Token inválido."
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(
        jwt_header,
        jwt_payload
    ):
        return jsonify({
            "erro": "Token expirado."
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "erro": "Token de autenticação não enviado."
        }), 401

    # =========================================
    # MODELS
    # =========================================

    from .models import (
        Usuario,
        Parceiro,
        Anuncio,
        AnuncioDisponibilidade,
        AnuncioImagem
    )

    # =========================================
    # ROUTES
    # =========================================

    from .routes.usuarios import usuarios_bp
    from .routes.parceiros import parceiros_bp
    from .routes.auth import auth_bp
    from .routes.anuncios import anuncios_bp

    # =========================================
    # REGISTRO COM /api
    # =========================================

    app.register_blueprint(
        usuarios_bp,
        name="usuarios_api"
    )

    app.register_blueprint(
        parceiros_bp,
        name="parceiros_api"
    )

    app.register_blueprint(
        auth_bp,
        name="auth_api"
    )

    app.register_blueprint(
        anuncios_bp,
        name="anuncios_api"
    )

    # =========================================
    # REGISTRO SEM /api
    # =========================================

    app.register_blueprint(
        usuarios_bp,
        url_prefix="/",
        name="usuarios_root"
    )

    app.register_blueprint(
        parceiros_bp,
        url_prefix="/",
        name="parceiros_root"
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/",
        name="auth_root"
    )

    # =========================================
    # HEALTH
    # =========================================

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "message": "Conecta Bandeirante API funcionando"
        }

    @app.get("/api/health/database")
    def database_health():
        try:
            db.session.execute(
                db.text("SELECT 1")
            )

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