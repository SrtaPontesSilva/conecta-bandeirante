from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

from ..models.usuario import Usuario
from ..models.parceiro import Parceiro


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


@auth_bp.post("/login")
def login():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({
            "erro": "Dados não enviados."
        }), 400

    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not email or not senha:
        return jsonify({
            "erro": "E-mail e senha são obrigatórios."
        }), 400

    # Primeiro procura entre usuários
    usuario = Usuario.query.filter_by(email=email).first()

    if usuario and check_password_hash(usuario.senha_hash, senha):
        return jsonify({
            "mensagem": "Login realizado com sucesso.",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "sobrenome": usuario.sobrenome,
                "email": usuario.email,
                "tipo": "usuario"
            }
        }), 200

    # Depois procura entre parceiros
    parceiro = Parceiro.query.filter_by(email=email).first()

    if parceiro and check_password_hash(parceiro.senha_hash, senha):
        return jsonify({
            "mensagem": "Login realizado com sucesso.",
            "parceiro": {
                "id": parceiro.id,
                "nome_estabelecimento": parceiro.nome_estabelecimento,
                "email": parceiro.email,
                "telefone_comercial": parceiro.telefone_comercial,
                "tipo": "parceiro"
            }
        }), 200

    return jsonify({
        "erro": "E-mail ou senha inválidos."
    }), 401