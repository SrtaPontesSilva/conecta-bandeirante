from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from ..extensions import db
from ..models.anuncio import (
    Anuncio,
    AnuncioDisponibilidade
)
from ..models.usuario import Usuario


anuncios_bp = Blueprint(
    "anuncios",
    __name__,
    url_prefix="/api/anuncios"
)


MODALIDADES_VALIDAS = {
    "doacao",
    "troca",
    "venda"
}

CONDICOES_VALIDAS = {
    "novo",
    "bom_estado",
    "usado"
}


@anuncios_bp.post("")
@jwt_required()
def cadastrar_anuncio():
    usuario_id = get_jwt_identity()
    tipo = get_jwt().get("tipo")

    # =========================================
    # VERIFICAÇÃO DO TIPO DE CONTA
    # =========================================

    if tipo != "usuario":
        return jsonify({
            "erro": "Apenas usuários podem publicar anúncios."
        }), 403

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    try:
        usuario_id = int(usuario_id)
    except (TypeError, ValueError):
        return jsonify({
            "erro": "Identificação do usuário inválida."
        }), 401

    # =========================================
    # VERIFICAÇÃO DO USUÁRIO
    # =========================================

    usuario = db.session.get(
        Usuario,
        usuario_id
    )

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    # =========================================
    # DADOS DO ANÚNCIO
    # =========================================

    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({
            "erro": "Dados não enviados."
        }), 400

    titulo = dados.get("titulo", "").strip()
    descricao = dados.get("descricao", "").strip()
    categoria = dados.get("categoria", "").strip().lower()
    modalidade = dados.get("modalidade", "").strip().lower()
    condicao = dados.get("condicao", "").strip().lower()
    preco = dados.get("preco")
    datas = dados.get("datas", [])

    # =========================================
    # VALIDAÇÕES
    # =========================================

    if not titulo:
        return jsonify({
            "erro": "Título é obrigatório."
        }), 400

    if not descricao:
        return jsonify({
            "erro": "Descrição é obrigatória."
        }), 400

    if not categoria:
        return jsonify({
            "erro": "Categoria é obrigatória."
        }), 400

    if modalidade not in MODALIDADES_VALIDAS:
        return jsonify({
            "erro": "Modalidade inválida."
        }), 400

    if condicao not in CONDICOES_VALIDAS:
        return jsonify({
            "erro": "Condição do item inválida."
        }), 400

    if not isinstance(datas, list) or not datas:
        return jsonify({
            "erro": "Selecione pelo menos uma data disponível."
        }), 400

    # =========================================
    # PREÇO
    # =========================================

    if modalidade == "venda":
        if preco is None or preco == "":
            return jsonify({
                "erro": "Informe o preço para anúncios de venda."
            }), 400

        try:
            preco = float(preco)
        except (TypeError, ValueError):
            return jsonify({
                "erro": "Preço inválido."
            }), 400

        if preco <= 0:
            return jsonify({
                "erro": "O preço deve ser maior que zero."
            }), 400

    else:
        preco = None

    # =========================================
    # DATAS
    # =========================================

    datas_convertidas = []

    try:
        for data in datas:
            data_convertida = datetime.strptime(
                data,
                "%Y-%m-%d"
            ).date()

            datas_convertidas.append(
                data_convertida
            )

    except (TypeError, ValueError):
        return jsonify({
            "erro": "Uma ou mais datas são inválidas."
        }), 400

    # =========================================
    # CRIAÇÃO DO ANÚNCIO
    # =========================================

    anuncio = Anuncio(
        titulo=titulo,
        descricao=descricao,
        categoria=categoria,
        modalidade=modalidade,
        condicao=condicao,
        preco=preco,
        usuario_id=usuario_id
    )

    db.session.add(anuncio)

    for data in datas_convertidas:
        disponibilidade = AnuncioDisponibilidade(
            anuncio=anuncio,
            data=data
        )

        db.session.add(disponibilidade)

    db.session.commit()

    # =========================================
    # RESPOSTA
    # =========================================

    return jsonify({
        "mensagem": "Anúncio publicado com sucesso.",
        "anuncio": {
            "id": anuncio.id,
            "titulo": anuncio.titulo,
            "descricao": anuncio.descricao,
            "categoria": anuncio.categoria,
            "modalidade": anuncio.modalidade,
            "condicao": anuncio.condicao,
            "preco": float(anuncio.preco)
                if anuncio.preco is not None
                else None,
            "status": anuncio.status,
            "datas": [
                disponibilidade.data.isoformat()
                for disponibilidade
                in anuncio.disponibilidades
            ]
        }
    }), 201


@anuncios_bp.get("")
def listar_anuncios():
    anuncios = Anuncio.query.filter_by(
        status="disponivel"
    ).order_by(
        Anuncio.criado_em.desc()
    ).all()

    resultado = []

    for anuncio in anuncios:
        resultado.append({
            "id": anuncio.id,
            "titulo": anuncio.titulo,
            "descricao": anuncio.descricao,
            "categoria": anuncio.categoria,
            "modalidade": anuncio.modalidade,
            "condicao": anuncio.condicao,
            "preco": float(anuncio.preco)
                if anuncio.preco is not None
                else None,
            "status": anuncio.status,
            "usuario_id": anuncio.usuario_id,
            "datas": [
                disponibilidade.data.isoformat()
                for disponibilidade
                in anuncio.disponibilidades
            ]
        })

    return jsonify(resultado), 200


@anuncios_bp.get("/<int:anuncio_id>")
def obter_anuncio(anuncio_id):
    anuncio = db.session.get(
        Anuncio,
        anuncio_id
    )

    if not anuncio:
        return jsonify({
            "erro": "Anúncio não encontrado."
        }), 404

    return jsonify({
        "id": anuncio.id,
        "titulo": anuncio.titulo,
        "descricao": anuncio.descricao,
        "categoria": anuncio.categoria,
        "modalidade": anuncio.modalidade,
        "condicao": anuncio.condicao,
        "preco": float(anuncio.preco)
            if anuncio.preco is not None
            else None,
        "status": anuncio.status,
        "usuario_id": anuncio.usuario_id,
        "datas": [
            disponibilidade.data.isoformat()
            for disponibilidade
            in anuncio.disponibilidades
        ]
    }), 200
