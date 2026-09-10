from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from .extensions import db


def create_app():
    load_dotenv()

    app = Flask(__name__)

    # 1. Correção para bancos PostgreSQL na nuvem e uso do driver moderno (psycopg v3)
    # Evita o erro 'ModuleNotFoundError: No module named psycopg2' forçando o uso do pacote psycopg já instalado
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # SECURITY
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")

    # 2. Configuração de CORS Ampla para Testes e Produção
    # Libera de forma ampla para evitar bloqueios de preflight do navegador caso as rotas retornem erro ou 404
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    db.init_app(app)
    Migrate(app, db)
    jwt = JWTManager(app)

    # =========================================
    # ERROS DE AUTENTICAÇÃO JWT
    # =========================================
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"erro": "Token inválido."}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"erro": "Token expirado."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"erro": "Token de autenticação não enviado."}), 401

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
    # ROUTES (Mapeadas para alinhar com o React)
    # =========================================
    from .routes.usuarios import usuarios_bp
    from .routes.parceiros import parceiros_bp
    from .routes.auth import auth_bp
    from .routes.anuncios import anuncios_bp

    # Se suas rotas no arquivo de rotas já possuírem o prefixo /api manualmente, 
    # mantenha o registro simples. Caso contrário, adicione url_prefix="/api" como abaixo:
    app.register_blueprint(usuarios_bp, url_prefix="/api")
    app.register_blueprint(parceiros_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(anuncios_bp, url_prefix="/api")

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
