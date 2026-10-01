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

    return len(telefone) in (10, 11)


def cnpj_valido(cnpj):
    cnpj = re.sub(r"\D", "", cnpj)

    if len(cnpj) != 14:
        return False

    if cnpj == cnpj[0] * 14:
        return False

    numeros = [int(numero) for numero in cnpj]

    pesos_primeiro = [
        5, 4, 3, 2,
        9, 8, 7, 6,
        5, 4, 3, 2
    ]

    soma = sum(
        numero * peso
        for numero, peso in zip(
            numeros[:12],
            pesos_primeiro
        )
    )

    resto = soma % 11

    primeiro_digito = (
        0 if resto < 2 else 11 - resto
    )

    if numeros[12] != primeiro_digito:
        return False

    pesos_segundo = [
        6, 5, 4, 3, 2,
        9, 8, 7, 6, 5, 4, 3, 2
    ]

    soma = sum(
        numero * peso
        for numero, peso in zip(
            numeros[:13],
            pesos_segundo
        )
    )

    resto = soma % 11

    segundo_digito = (
        0 if resto < 2 else 11 - resto
    )

    return numeros[13] == segundo_digito


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

    cnpj = re.sub(
        r"\D",
        "",
        dados.get("cnpj", "")
    )

    email = dados.get(
        "email",
        ""
    ).strip().lower()

    telefone_comercial = re.sub(
        r"\D",
        "",
        dados.get(
            "telefone_comercial",
            ""
        )
    )

    senha = dados.get(
        "senha",
        ""
    )

    if not nome_estabelecimento:
        return jsonify({
            "erro": "Nome do estabelecimento é obrigatório."
        }), 400

    if not cnpj_valido(cnpj):
        return jsonify({
            "erro": "CNPJ inválido."
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

    if Parceiro.query.filter_by(
        email=email
    ).first():
        return jsonify({
            "erro": "Este e-mail já está cadastrado."
        }), 409

    if Parceiro.query.filter_by(
        cnpj=cnpj
    ).first():
        return jsonify({
            "erro": "Este CNPJ já está cadastrado."
        }), 409

    parceiro = Parceiro(
        nome_estabelecimento=nome_estabelecimento,
        cnpj=cnpj,
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
            "nome_estabelecimento":
                parceiro.nome_estabelecimento,
            "cnpj": parceiro.cnpj,
            "email": parceiro.email,
            "telefone_comercial":
                parceiro.telefone_comercial
        }
    }), 201