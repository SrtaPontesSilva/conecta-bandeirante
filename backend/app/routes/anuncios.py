from datetime import datetime
import os

import cloudinary
import cloudinary.uploader

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

from ..models.anuncio_imagem import (
    AnuncioImagem
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


TIPOS_IMAGEM_VALIDOS = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


MAX_IMAGENS = 5

MAX_TAMANHO_IMAGEM = 4 * 1024 * 1024


def cloudinary_configurado():
    return all([
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET")
    ])


def serializar_imagens(anuncio):
    return [
        {
            "id": imagem.id,
            "url": imagem.url,
            "ordem": imagem.ordem
        }
        for imagem in anuncio.imagens
    ]


def obter_nome_publicador(anuncio):
    usuario = db.session.get(
        Usuario,
        anuncio.usuario_id
    )

    if not usuario:
        return "Usuário"

    nome = usuario.nome or ""
    sobrenome = usuario.sobrenome or ""

    nome_completo = (
        f"{nome} {sobrenome}"
    ).strip()

    return nome_completo or "Usuário"


def serializar_anuncio(anuncio):
    return {
        "id": anuncio.id,

        "titulo": anuncio.titulo,

        "descricao": anuncio.descricao,

        "categoria": anuncio.categoria,

        "modalidade": anuncio.modalidade,

        "condicao": anuncio.condicao,

        "preco": (
            float(anuncio.preco)
            if anuncio.preco is not None
            else None
        ),

        "status": anuncio.status,

        "usuario_id": anuncio.usuario_id,

        "publicado_por": obter_nome_publicador(
            anuncio
        ),

        "datas": [
            disponibilidade.data.isoformat()
            for disponibilidade
            in anuncio.disponibilidades
        ],

        "imagens": serializar_imagens(
            anuncio
        )
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
    # DADOS DO FORMULÁRIO
    # =========================================

    titulo = request.form.get(
        "titulo",
        ""
    ).strip()

    descricao = request.form.get(
        "descricao",
        ""
    ).strip()

    categoria = request.form.get(
        "categoria",
        ""
    ).strip().lower()

    modalidade = request.form.get(
        "modalidade",
        ""
    ).strip().lower()

    condicao = request.form.get(
        "condicao",
        ""
    ).strip().lower()

    preco = request.form.get(
        "preco"
    )

    datas = request.form.getlist(
        "datas"
    )

    imagens = request.files.getlist(
        "imagens"
    )

    # =========================================
    # VALIDAÇÕES
    # =========================================

    if not titulo:
        return jsonify({
            "erro": "Título é obrigatório."
        }), 400

    if len(titulo) > 150:
        return jsonify({
            "erro": "O título deve ter no máximo 150 caracteres."
        }), 400

    if not descricao:
        return jsonify({
            "erro": "Descrição é obrigatória."
        }), 400

    if len(descricao) > 600:
        return jsonify({
            "erro": "A descrição deve ter no máximo 600 caracteres."
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

    if not datas:
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
    # IMAGENS
    # =========================================

    if len(imagens) > MAX_IMAGENS:
        return jsonify({
            "erro": (
                f"Você pode enviar no máximo "
                f"{MAX_IMAGENS} imagens."
            )
        }), 400

    if imagens and not cloudinary_configurado():
        return jsonify({
            "erro": (
                "O armazenamento de imagens "
                "não está configurado no servidor."
            )
        }), 503

    for imagem in imagens:
        if not imagem or not imagem.filename:
            return jsonify({
                "erro": "Uma das imagens enviadas é inválida."
            }), 400

        if imagem.mimetype not in TIPOS_IMAGEM_VALIDOS:
            return jsonify({
                "erro": (
                    "Formato de imagem não permitido. "
                    "Use JPG, PNG ou WebP."
                )
            }), 400

        try:
            imagem.stream.seek(
                0,
                os.SEEK_END
            )

            tamanho = imagem.stream.tell()

            imagem.stream.seek(0)

        except (OSError, ValueError):
            return jsonify({
                "erro": (
                    "Não foi possível verificar "
                    "o tamanho de uma imagem."
                )
            }), 400

        if tamanho > MAX_TAMANHO_IMAGEM:
            return jsonify({
                "erro": (
                    "Cada imagem deve ter no máximo 4 MB."
                )
            }), 400

    # =========================================
    # UPLOAD CLOUDINARY
    # =========================================

    imagens_upload = []

    try:
        for ordem, imagem in enumerate(imagens):

            imagem.stream.seek(0)

            resultado_upload = cloudinary.uploader.upload(
                imagem.stream,
                folder="conecta-bandeirante/anuncios",
                resource_type="image"
            )

            imagens_upload.append({
                "url": resultado_upload["secure_url"],
                "public_id": resultado_upload["public_id"],
                "ordem": ordem
            })

    except Exception:
        for imagem_upload in imagens_upload:
            try:
                cloudinary.uploader.destroy(
                    imagem_upload["public_id"],
                    resource_type="image",
                    invalidate=True
                )

            except Exception:
                pass

        return jsonify({
            "erro": (
                "Não foi possível enviar as imagens. "
                "Tente novamente."
            )
        }), 502

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

    try:
        db.session.flush()

        # =====================================
        # DISPONIBILIDADES
        # =====================================

        for data in datas_convertidas:
            disponibilidade = AnuncioDisponibilidade(
                anuncio=anuncio,
                data=data
            )

            db.session.add(
                disponibilidade
            )

        # =====================================
        # IMAGENS
        # =====================================

        for imagem_upload in imagens_upload:
            imagem = AnuncioImagem(
                anuncio=anuncio,
                url=imagem_upload["url"],
                public_id=imagem_upload["public_id"],
                ordem=imagem_upload["ordem"]
            )

            db.session.add(
                imagem
            )

        db.session.commit()

    except Exception:
        db.session.rollback()

        for imagem_upload in imagens_upload:
            try:
                cloudinary.uploader.destroy(
                    imagem_upload["public_id"],
                    resource_type="image",
                    invalidate=True
                )

            except Exception:
                pass

        return jsonify({
            "erro": (
                "Não foi possível salvar "
                "o anúncio."
            )
        }), 500

    # =========================================
    # RESPOSTA
    # =========================================

    return jsonify({
        "mensagem": "Anúncio publicado com sucesso.",
        "anuncio": serializar_anuncio(
            anuncio
        )
    }), 201


@anuncios_bp.get("")
def listar_anuncios():
    anuncios = Anuncio.query.filter_by(
        status="disponivel"
    ).order_by(
        Anuncio.criado_em.desc()
    ).all()

    resultado = [
        serializar_anuncio(anuncio)
        for anuncio in anuncios
    ]

    return jsonify(
        resultado
    ), 200


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

    return jsonify(
        serializar_anuncio(anuncio)
    ), 200