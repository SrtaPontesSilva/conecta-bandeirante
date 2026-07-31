import re

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from ..extensions import db
from ..models.usuario import Usuario


usuarios_bp = Blueprint(
    "usuarios",
    __name__,
    url_prefix="/api/usuarios"
)


def cpf_valido(cpf):
    cpf = re.sub(r"\D", "", cpf)

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    # Primeiro dígito verificador
    soma = sum(
        int(cpf[i]) * (10 - i)
        for i in range(9)
    )

    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cpf[9]) != digito1:
        return False

    # Segundo dígito verificador
    soma = sum(
        int(cpf[i]) * (11 - i)
        for i in range(10)
    )

    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    return int(cpf[10]) == digito2


@usuarios_bp.post("")
def cadastrar_usuario():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({
            "erro": "Dados não enviados."
        }), 400

    nome = dados.get("nome", "").strip()
    sobrenome = dados.get("sobrenome", "").strip()
    email = dados.get("email", "").strip().lower()
    cpf = re.sub(r"\D", "", dados.get("cpf", ""))
    senha = dados.get("senha", "")

    if not nome or not sobrenome:
        return jsonify({
            "erro": "Nome e sobrenome são obrigatórios."
        }), 400

    if not email:
        return jsonify({
            "erro": "E-mail é obrigatório."
        }), 400

    if not cpf_valido(cpf):
        return jsonify({
            "erro": "CPF inválido."
        }), 400

    if len(senha) < 8:
        return jsonify({
            "erro": "A senha deve possuir pelo menos 8 caracteres."
        }), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({
            "erro": "Este e-mail já está cadastrado."
        }), 409

    if Usuario.query.filter_by(cpf=cpf).first():
        return jsonify({
            "erro": "Este CPF já está cadastrado."
        }), 409

    usuario = Usuario(
        nome=nome,
        sobrenome=sobrenome,
        email=email,
        cpf=cpf,
        senha_hash=generate_password_hash(senha)
    )

    db.session.add(usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário cadastrado com sucesso.",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "sobrenome": usuario.sobrenome,
            "email": usuario.email
        }
    }), 201