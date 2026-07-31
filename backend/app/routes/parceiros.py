import re

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from ..extensions import db
from ..models.parceiro import Parceiro


parceiros_bp = Blueprint(
    "parceiros",
    __name__,
    url_prefix="/api/parceiros"
)


def telefone_valido(telefone):
    telefone = re.sub(r"\D", "", telefone)

    # Telefone comercial brasileiro:
    # 10 dígitos: (61) 3333-4444
    # 11 dígitos: (61) 93333-4444
    return len(telefone) in (10, 11)


@parceiros_bp.post("")
def cadastrar_parceiro():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({
            "erro": "Dados não enviados."
        }), 400

    nome_estabelecimento = dados.get(
        "nome_estabelecimento",
        ""
    ).strip()

    email = dados.get(
        "email",
        ""
    ).strip().lower()

    telefone_comercial = re.sub(
        r"\D",
        "",
        dados.get("telefone_comercial", "")
    )

    senha = dados.get("senha", "")

    if not nome_estabelecimento:
        return jsonify({
            "erro": "Nome do estabelecimento é obrigatório."
        }), 400

    if not email:
        return jsonify({
            "erro": "E-mail é obrigatório."
        }), 400

    if not telefone_valido(telefone_comercial):
        return jsonify({
            "erro": "Telefone comercial inválido."
        }), 400

    if len(senha) < 8:
        return jsonify({
            "erro": "A senha deve possuir pelo menos 8 caracteres."
        }), 400

    if Parceiro.query.filter_by(email=email).first():
        return jsonify({
            "erro": "Este e-mail já está cadastrado."
        }), 409

    parceiro = Parceiro(
        nome_estabelecimento=nome_estabelecimento,
        email=email,
        telefone_comercial=telefone_comercial,
        senha_hash=generate_password_hash(senha)
    )

    db.session.add(parceiro)
    db.session.commit()

    return jsonify({
        "mensagem": "Parceiro cadastrado com sucesso.",
        "parceiro": {
            "id": parceiro.id,
            "nome_estabelecimento": parceiro.nome_estabelecimento,
            "email": parceiro.email,
            "telefone_comercial": parceiro.telefone_comercial
        }
    }), 201
