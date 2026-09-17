from flask import Blueprint, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from ..extensions import db

from ..models.notificacao import (
    Notificacao
)


notificacoes_bp = Blueprint(
    "notificacoes",
    __name__,
    url_prefix="/api/notificacoes"
)


def obter_usuario_id():

    usuario_id = get_jwt_identity()

    try:
        return int(usuario_id)

    except (TypeError, ValueError):
        return None


def serializar_notificacao(
    notificacao
):
    return {
        "id": notificacao.id,

        "tipo": notificacao.tipo,

        "titulo": notificacao.titulo,

        "mensagem": notificacao.mensagem,

        "lida": notificacao.lida,

        "referencia_id": (
            notificacao.referencia_id
        ),

        "criada_em": (
            notificacao.criada_em.isoformat()
            if notificacao.criada_em
            else None
        )
    }


# ============================================================
# LISTAR
# ============================================================

@notificacoes_bp.get("")
@jwt_required()
def listar_notificacoes():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    notificacoes = Notificacao.query.filter_by(
        usuario_id=usuario_id
    ).order_by(
        Notificacao.criada_em.desc()
    ).all()

    nao_lidas = sum(
        1
        for notificacao in notificacoes
        if not notificacao.lida
    )

    return jsonify({
        "notificacoes": [
            serializar_notificacao(
                notificacao
            )
            for notificacao in notificacoes
        ],
        "nao_lidas": nao_lidas
    }), 200


# ============================================================
# MARCAR COMO LIDA
# ============================================================

@notificacoes_bp.patch(
    "/<int:notificacao_id>/lida"
)
@jwt_required()
def marcar_como_lida(
    notificacao_id
):

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    notificacao = db.session.get(
        Notificacao,
        notificacao_id
    )

    if not notificacao:
        return jsonify({
            "erro": "Notificação não encontrada."
        }), 404

    if notificacao.usuario_id != usuario_id:
        return jsonify({
            "erro": (
                "Você não pode alterar "
                "esta notificação."
            )
        }), 403

    notificacao.lida = True

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível atualizar "
                "a notificação."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Notificação marcada como lida."
        )
    }), 200


# ============================================================
# TODAS COMO LIDAS
# ============================================================

@notificacoes_bp.patch(
    "/marcar-todas-lidas"
)
@jwt_required()
def marcar_todas_como_lidas():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    Notificacao.query.filter_by(
        usuario_id=usuario_id,
        lida=False
    ).update(
        {
            "lida": True
        },
        synchronize_session=False
    )

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível atualizar "
                "as notificações."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Todas as notificações foram "
            "marcadas como lidas."
        )
    }), 200