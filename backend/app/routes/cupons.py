from datetime import datetime
import os

import cloudinary
import cloudinary.uploader

from flask import (
    Blueprint,
    request,
    jsonify
)

from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    jwt_required
)

from ..extensions import db
from ..models.cupom import Cupom


cupons_bp = Blueprint(
    "cupons",
    __name__,
    url_prefix="/api/cupons"
)


# ============================================================
# CONFIGURAÇÕES
# ============================================================

CATEGORIAS_VALIDAS = {
    "alimentacao",
    "cafeteria",
    "papelaria",
    "lazer",
    "servicos",
    "outros"
}


TIPOS_IMAGEM_VALIDOS = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


MAX_TAMANHO_IMAGEM = 4 * 1024 * 1024


PASTA_CLOUDINARY = (
    "conecta-bandeirante/cupons"
)


# ============================================================
# CLOUDINARY
# ============================================================

def cloudinary_configurado():
    return all([
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET")
    ])


# ============================================================
# AUTENTICAÇÃO
# ============================================================

def parceiro_autenticado():
    claims = get_jwt()

    if claims.get("tipo") != "parceiro":
        return None

    try:
        parceiro_id = int(
            get_jwt_identity()
        )

    except (TypeError, ValueError):
        return None

    return parceiro_id


# ============================================================
# DATAS
# ============================================================

def formatar_data(data):
    if not data:
        return None

    return data.strftime(
        "%Y-%m-%dT%H:%M:%S"
    )


def converter_data(valor):
    if not valor:
        return None

    try:
        return datetime.fromisoformat(
            valor.replace("Z", "+00:00")
        ).replace(tzinfo=None)

    except (
        ValueError,
        AttributeError
    ):
        return None


# ============================================================
# SERIALIZAÇÃO
# ============================================================

def cupom_para_json(cupom):
    return {
        "id": cupom.id,

        "parceiro_id": cupom.parceiro_id,

        "titulo": cupom.titulo,

        "descricao": cupom.descricao,

        "categoria": cupom.categoria,

        "imagem_url": cupom.imagem_url,

        "imagem_public_id": (
            cupom.imagem_public_id
        ),

        "pontos": cupom.pontos,

        "limite_resgates": (
            cupom.limite_resgates
        ),

        "validade_inicio": formatar_data(
            cupom.validade_inicio
        ),

        "validade_fim": formatar_data(
            cupom.validade_fim
        ),

        "regras": cupom.regras,

        "ativo": cupom.ativo,

        "criado_em": formatar_data(
            cupom.criado_em
        ),

        "atualizado_em": formatar_data(
            cupom.atualizado_em
        )
    }


# ============================================================
# VALIDAÇÃO DOS DADOS
# ============================================================

def validar_dados_cupom(dados):
    erros = {}

    titulo = dados.get(
        "titulo",
        ""
    )

    descricao = dados.get(
        "descricao",
        ""
    )

    categoria = dados.get(
        "categoria",
        ""
    )

    pontos = dados.get(
        "pontos"
    )

    limite_resgates = dados.get(
        "limite_resgates"
    )

    validade_inicio = dados.get(
        "validade_inicio"
    )

    validade_fim = dados.get(
        "validade_fim"
    )

    regras = dados.get(
        "regras",
        ""
    )

    # ========================================================
    # TÍTULO
    # ========================================================

    if not isinstance(titulo, str):
        erros["titulo"] = (
            "Título inválido."
        )

    else:
        titulo = titulo.strip()

        if not titulo:
            erros["titulo"] = (
                "Título é obrigatório."
            )

        elif len(titulo) > 150:
            erros["titulo"] = (
                "Título deve possuir no máximo "
                "150 caracteres."
            )

    # ========================================================
    # DESCRIÇÃO
    # ========================================================

    if not isinstance(descricao, str):
        erros["descricao"] = (
            "Descrição inválida."
        )

    else:
        descricao = descricao.strip()

        if not descricao:
            erros["descricao"] = (
                "Descrição é obrigatória."
            )

        elif len(descricao) > 600:
            erros["descricao"] = (
                "Descrição deve possuir no máximo "
                "600 caracteres."
            )

    # ========================================================
    # CATEGORIA
    # ========================================================

    if not isinstance(categoria, str):
        erros["categoria"] = (
            "Categoria inválida."
        )

    else:
        categoria = categoria.strip().lower()

        if categoria not in CATEGORIAS_VALIDAS:
            erros["categoria"] = (
                "Categoria inválida."
            )

    # ========================================================
    # PONTOS
    # ========================================================

    try:
        pontos = int(pontos)

        if pontos <= 0:
            erros["pontos"] = (
                "A quantidade de pontos deve ser "
                "maior que zero."
            )

    except (
        TypeError,
        ValueError
    ):
        erros["pontos"] = (
            "Pontos devem ser um número inteiro."
        )

    # ========================================================
    # LIMITE DE RESGATES
    # ========================================================

    if (
        limite_resgates is not None
        and limite_resgates != ""
    ):
        try:
            limite_resgates = int(
                limite_resgates
            )

            if limite_resgates <= 0:
                erros["limite_resgates"] = (
                    "O limite de resgates deve ser "
                    "maior que zero."
                )

        except (
            TypeError,
            ValueError
        ):
            erros["limite_resgates"] = (
                "O limite de resgates deve ser "
                "um número inteiro."
            )

    else:
        limite_resgates = None

    # ========================================================
    # DATA INICIAL
    # ========================================================

    inicio = converter_data(
        validade_inicio
    )

    if inicio is None:
        erros["validade_inicio"] = (
            "Data inicial inválida."
        )

    # ========================================================
    # DATA FINAL
    # ========================================================

    fim = converter_data(
        validade_fim
    )

    if fim is None:
        erros["validade_fim"] = (
            "Data final inválida."
        )

    # ========================================================
    # COMPARAÇÃO DAS DATAS
    # ========================================================

    if (
        inicio is not None
        and fim is not None
        and fim <= inicio
    ):
        erros["validade_fim"] = (
            "A data final deve ser posterior "
            "à data inicial."
        )

    # ========================================================
    # REGRAS
    # ========================================================

    if regras is not None:

        if not isinstance(regras, str):
            erros["regras"] = (
                "Regras inválidas."
            )

        else:
            regras = regras.strip()

            if len(regras) > 1000:
                erros["regras"] = (
                    "As regras devem possuir no máximo "
                    "1000 caracteres."
                )

    return {
        "erros": erros,

        "titulo": (
            titulo.strip()
            if isinstance(titulo, str)
            else titulo
        ),

        "descricao": (
            descricao.strip()
            if isinstance(descricao, str)
            else descricao
        ),

        "categoria": (
            categoria.strip().lower()
            if isinstance(categoria, str)
            else categoria
        ),

        "pontos": pontos,

        "limite_resgates": limite_resgates,

        "validade_inicio": inicio,

        "validade_fim": fim,

        "regras": regras
    }


# ============================================================
# VALIDAÇÃO DA IMAGEM
# ============================================================

def validar_imagem(imagem):
    if not imagem:
        return (
            "Imagem inválida."
        )

    if not imagem.filename:
        return (
            "Imagem inválida."
        )

    if imagem.mimetype not in TIPOS_IMAGEM_VALIDOS:
        return (
            "Formato de imagem não permitido. "
            "Use JPG, PNG ou WebP."
        )

    try:
        imagem.stream.seek(
            0,
            os.SEEK_END
        )

        tamanho = imagem.stream.tell()

        imagem.stream.seek(0)

    except (
        OSError,
        ValueError
    ):
        return (
            "Não foi possível verificar "
            "o tamanho da imagem."
        )

    if tamanho > MAX_TAMANHO_IMAGEM:
        return (
            "A imagem deve ter no máximo 4 MB."
        )

    return None


# ============================================================
# UPLOAD DE IMAGEM
# ============================================================

def enviar_imagem_cloudinary(imagem):
    imagem.stream.seek(0)

    resultado = cloudinary.uploader.upload(
        imagem.stream,
        folder=PASTA_CLOUDINARY,
        resource_type="image"
    )

    return {
        "url": resultado["secure_url"],
        "public_id": resultado["public_id"]
    }


# ============================================================
# REMOVER IMAGEM DO CLOUDINARY
# ============================================================

def remover_imagem_cloudinary(public_id):
    if not public_id:
        return

    try:
        cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            invalidate=True
        )

    except Exception:
        pass


# ============================================================
# CRIAR CUPOM
# ============================================================

@cupons_bp.post("")
@jwt_required()
def criar_cupom():

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "criar cupons."
            )
        }), 403

    # ========================================================
    # VERIFICAÇÃO CLOUDINARY
    # ========================================================

    if not cloudinary_configurado():
        return jsonify({
            "erro": (
                "O armazenamento de imagens "
                "não está configurado no servidor."
            )
        }), 503

    # ========================================================
    # DADOS DO FORMULÁRIO
    # ========================================================

    dados = request.form

    imagem = request.files.get(
        "imagem"
    )

    dados_cupom = {
        "titulo": dados.get(
            "titulo",
            ""
        ),

        "descricao": dados.get(
            "descricao",
            ""
        ),

        "categoria": dados.get(
            "categoria",
            ""
        ),

        "pontos": dados.get(
            "pontos"
        ),

        "limite_resgates": dados.get(
            "limite_resgates"
        ),

        "validade_inicio": dados.get(
            "validade_inicio"
        ),

        "validade_fim": dados.get(
            "validade_fim"
        ),

        "regras": dados.get(
            "regras",
            ""
        )
    }

    # ========================================================
    # VALIDAÇÃO DOS CAMPOS
    # ========================================================

    resultado = validar_dados_cupom(
        dados_cupom
    )

    if resultado["erros"]:
        return jsonify({
            "erro": "Dados inválidos.",
            "campos": resultado["erros"]
        }), 400

    # ========================================================
    # VALIDAÇÃO DA IMAGEM
    # ========================================================

    if imagem:

        erro_imagem = validar_imagem(
            imagem
        )

        if erro_imagem:
            return jsonify({
                "erro": erro_imagem
            }), 400

    # ========================================================
    # UPLOAD DA IMAGEM
    # ========================================================

    imagem_upload = None

    if imagem:

        try:
            imagem_upload = (
                enviar_imagem_cloudinary(
                    imagem
                )
            )

        except Exception:
            return jsonify({
                "erro": (
                    "Não foi possível enviar "
                    "a imagem. Tente novamente."
                )
            }), 502

    # ========================================================
    # CRIAÇÃO DO CUPOM
    # ========================================================

    cupom = Cupom(
        parceiro_id=parceiro_id,

        titulo=resultado["titulo"],

        descricao=resultado["descricao"],

        categoria=resultado["categoria"],

        imagem_url=(
            imagem_upload["url"]
            if imagem_upload
            else None
        ),

        imagem_public_id=(
            imagem_upload["public_id"]
            if imagem_upload
            else None
        ),

        pontos=resultado["pontos"],

        limite_resgates=(
            resultado["limite_resgates"]
        ),

        validade_inicio=(
            resultado["validade_inicio"]
        ),

        validade_fim=(
            resultado["validade_fim"]
        ),

        regras=resultado["regras"],

        ativo=True
    )

    db.session.add(
        cupom
    )

    # ========================================================
    # SALVAMENTO
    # ========================================================

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        if imagem_upload:
            remover_imagem_cloudinary(
                imagem_upload["public_id"]
            )

        return jsonify({
            "erro": (
                "Não foi possível salvar "
                "o cupom."
            )
        }), 500

    # ========================================================
    # RESPOSTA
    # ========================================================

    return jsonify({
        "mensagem": (
            "Cupom criado com sucesso."
        ),

        "cupom": cupom_para_json(
            cupom
        )
    }), 201


# ============================================================
# LISTAR MEUS CUPONS
# ============================================================

@cupons_bp.get("/meus")
@jwt_required()
def listar_meus_cupons():

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "acessar seus cupons."
            )
        }), 403

    ativos_param = request.args.get(
        "ativos"
    )

    query = Cupom.query.filter_by(
        parceiro_id=parceiro_id
    )

    if ativos_param == "true":

        query = query.filter_by(
            ativo=True
        )

    elif ativos_param == "false":

        query = query.filter_by(
            ativo=False
        )

    cupons = query.order_by(
        Cupom.criado_em.desc()
    ).all()

    return jsonify({
        "cupons": [
            cupom_para_json(cupom)
            for cupom in cupons
        ]
    }), 200


# ============================================================
# BUSCAR UM CUPOM
# ============================================================

@cupons_bp.get("/<int:cupom_id>")
@jwt_required()
def buscar_cupom(cupom_id):

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "acessar esta rota."
            )
        }), 403

    cupom = Cupom.query.filter_by(
        id=cupom_id,
        parceiro_id=parceiro_id
    ).first()

    if not cupom:
        return jsonify({
            "erro": "Cupom não encontrado."
        }), 404

    return jsonify({
        "cupom": cupom_para_json(
            cupom
        )
    }), 200


# ============================================================
# EDITAR CUPOM
# ============================================================

@cupons_bp.put("/<int:cupom_id>")
@jwt_required()
def editar_cupom(cupom_id):

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "editar cupons."
            )
        }), 403

    cupom = Cupom.query.filter_by(
        id=cupom_id,
        parceiro_id=parceiro_id
    ).first()

    if not cupom:
        return jsonify({
            "erro": "Cupom não encontrado."
        }), 404

    # ========================================================
    # DADOS
    # ========================================================

    dados = request.form

    imagem = request.files.get(
        "imagem"
    )

    dados_cupom = {
        "titulo": dados.get(
            "titulo",
            ""
        ),

        "descricao": dados.get(
            "descricao",
            ""
        ),

        "categoria": dados.get(
            "categoria",
            ""
        ),

        "pontos": dados.get(
            "pontos"
        ),

        "limite_resgates": dados.get(
            "limite_resgates"
        ),

        "validade_inicio": dados.get(
            "validade_inicio"
        ),

        "validade_fim": dados.get(
            "validade_fim"
        ),

        "regras": dados.get(
            "regras",
            ""
        )
    }

    # ========================================================
    # VALIDAÇÃO
    # ========================================================

    resultado = validar_dados_cupom(
        dados_cupom
    )

    if resultado["erros"]:
        return jsonify({
            "erro": "Dados inválidos.",
            "campos": resultado["erros"]
        }), 400

    # ========================================================
    # NOVA IMAGEM
    # ========================================================

    nova_imagem_upload = None

    if imagem:

        if not cloudinary_configurado():
            return jsonify({
                "erro": (
                    "O armazenamento de imagens "
                    "não está configurado no servidor."
                )
            }), 503

        erro_imagem = validar_imagem(
            imagem
        )

        if erro_imagem:
            return jsonify({
                "erro": erro_imagem
            }), 400

        try:

            nova_imagem_upload = (
                enviar_imagem_cloudinary(
                    imagem
                )
            )

        except Exception:

            return jsonify({
                "erro": (
                    "Não foi possível enviar "
                    "a nova imagem. Tente novamente."
                )
            }), 502

    # ========================================================
    # GUARDAR IMAGEM ANTIGA
    # ========================================================

    imagem_public_id_antiga = (
        cupom.imagem_public_id
    )

    # ========================================================
    # ATUALIZAÇÃO DOS DADOS
    # ========================================================

    cupom.titulo = resultado[
        "titulo"
    ]

    cupom.descricao = resultado[
        "descricao"
    ]

    cupom.categoria = resultado[
        "categoria"
    ]

    cupom.pontos = resultado[
        "pontos"
    ]

    cupom.limite_resgates = resultado[
        "limite_resgates"
    ]

    cupom.validade_inicio = resultado[
        "validade_inicio"
    ]

    cupom.validade_fim = resultado[
        "validade_fim"
    ]

    cupom.regras = resultado[
        "regras"
    ]

    # ========================================================
    # ATUALIZA IMAGEM SOMENTE SE UMA NOVA FOI ENVIADA
    # ========================================================

    if nova_imagem_upload:

        cupom.imagem_url = (
            nova_imagem_upload["url"]
        )

        cupom.imagem_public_id = (
            nova_imagem_upload[
                "public_id"
            ]
        )

    cupom.atualizado_em = (
        datetime.utcnow()
    )

    # ========================================================
    # SALVAR
    # ========================================================

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        if nova_imagem_upload:

            remover_imagem_cloudinary(
                nova_imagem_upload[
                    "public_id"
                ]
            )

        return jsonify({
            "erro": (
                "Não foi possível atualizar "
                "o cupom."
            )
        }), 500

    # ========================================================
    # REMOVER IMAGEM ANTIGA
    # ========================================================

    if (
        nova_imagem_upload
        and imagem_public_id_antiga
        and (
            imagem_public_id_antiga
            != nova_imagem_upload[
                "public_id"
            ]
        )
    ):

        remover_imagem_cloudinary(
            imagem_public_id_antiga
        )

    # ========================================================
    # RESPOSTA
    # ========================================================

    return jsonify({
        "mensagem": (
            "Cupom atualizado com sucesso."
        ),

        "cupom": cupom_para_json(
            cupom
        )
    }), 200


# ============================================================
# ARQUIVAR CUPOM
# ============================================================

@cupons_bp.patch(
    "/<int:cupom_id>/arquivar"
)
@jwt_required()
def arquivar_cupom(cupom_id):

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "arquivar cupons."
            )
        }), 403

    cupom = Cupom.query.filter_by(
        id=cupom_id,
        parceiro_id=parceiro_id
    ).first()

    if not cupom:
        return jsonify({
            "erro": "Cupom não encontrado."
        }), 404

    if not cupom.ativo:
        return jsonify({
            "erro": (
                "Este cupom já está arquivado."
            )
        }), 409

    cupom.ativo = False

    cupom.atualizado_em = (
        datetime.utcnow()
    )

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível arquivar "
                "o cupom."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Cupom arquivado com sucesso."
        ),

        "cupom": cupom_para_json(
            cupom
        )
    }), 200


# ============================================================
# ATIVAR CUPOM
# ============================================================

@cupons_bp.patch(
    "/<int:cupom_id>/ativar"
)
@jwt_required()
def ativar_cupom(cupom_id):

    parceiro_id = parceiro_autenticado()

    if parceiro_id is None:
        return jsonify({
            "erro": (
                "Apenas parceiros podem "
                "ativar cupons."
            )
        }), 403

    cupom = Cupom.query.filter_by(
        id=cupom_id,
        parceiro_id=parceiro_id
    ).first()

    if not cupom:
        return jsonify({
            "erro": "Cupom não encontrado."
        }), 404

    if cupom.ativo:
        return jsonify({
            "erro": (
                "Este cupom já está ativo."
            )
        }), 409

    if cupom.validade_fim <= datetime.utcnow():
        return jsonify({
            "erro": (
                "Não é possível ativar um cupom "
                "que já expirou."
            )
        }), 400

    cupom.ativo = True

    cupom.atualizado_em = (
        datetime.utcnow()
    )

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível ativar "
                "o cupom."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Cupom ativado com sucesso."
        ),

        "cupom": cupom_para_json(
            cupom
        )
    }), 200


# ============================================================
# CUPONS PÚBLICOS
# ============================================================

@cupons_bp.get("/publicos")
def listar_cupons_publicos():

    agora = datetime.utcnow()

    cupons = Cupom.query.filter(
        Cupom.ativo.is_(True),

        Cupom.validade_inicio <= agora,

        Cupom.validade_fim > agora
    ).order_by(
        Cupom.criado_em.desc()
    ).all()

    return jsonify({
        "cupons": [
            cupom_para_json(cupom)
            for cupom in cupons
        ]
    }), 200