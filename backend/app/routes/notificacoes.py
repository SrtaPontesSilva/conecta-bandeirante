from datetime import datetime

from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from ..extensions import db

from ..models.notificacao import Notificacao

from ..models.preferencia_notificacao import (
    PreferenciaNotificacao
)

from ..models.push_subscription import (
    PushSubscription
)


notificacoes_bp = Blueprint(
    "notificacoes",
    __name__,
    url_prefix="/api/notificacoes"
)


# ============================================================
# USUÁRIO ATUAL
# ============================================================

def obter_usuario_id():

    usuario_id = get_jwt_identity()

    try:
        return int(usuario_id)

    except (TypeError, ValueError):
        return None


# ============================================================
# SERIALIZAÇÃO DA DATA
# ============================================================

def serializar_data_notificacao(data):

    if not data:
        return None

    try:
        valor = data.isoformat()

    except (AttributeError, TypeError):
        return None

    if data.tzinfo is None:
        return f"{valor}+00:00"

    return valor


# ============================================================
# SERIALIZAÇÃO
# ============================================================

def serializar_notificacao(notificacao):

    return {
        "id": notificacao.id,
        "tipo": notificacao.tipo,
        "titulo": notificacao.titulo,
        "mensagem": notificacao.mensagem,
        "lida": notificacao.lida,
        "referencia_id": notificacao.referencia_id,
        "criada_em": (
            serializar_data_notificacao(
                notificacao.criada_em
            )
        )
    }


# ============================================================
# PREFERÊNCIAS PADRÃO
# ============================================================

def criar_preferencia_padrao(usuario_id):

    preferencia = PreferenciaNotificacao(
        usuario_id=usuario_id
    )

    db.session.add(preferencia)

    return preferencia


def obter_ou_criar_preferencia(usuario_id):

    preferencia = PreferenciaNotificacao.query.filter_by(
        usuario_id=usuario_id
    ).first()

    if preferencia:
        return preferencia

    return criar_preferencia_padrao(usuario_id)


def serializar_preferencias(preferencia):

    return {
        "id": preferencia.id,

        "notificacoes_push": (
            preferencia.notificacoes_push
        ),

        "notificacoes_email": (
            preferencia.notificacoes_email
        ),

        "solicitacoes": (
            preferencia.solicitacoes
        ),

        "aceitas": (
            preferencia.aceitas
        ),

        "recusadas": (
            preferencia.recusadas
        ),

        "reservas": (
            preferencia.reservas
        ),

        "retencao_dias": (
            preferencia.retencao_dias
        )
    }


# ============================================================
# LISTAR NOTIFICAÇÕES
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
# MARCAR UMA COMO LIDA
# ============================================================

@notificacoes_bp.patch(
    "/<int:notificacao_id>/lida"
)
@jwt_required()
def marcar_como_lida(notificacao_id):

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
# MARCAR TODAS COMO LIDAS
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


# ============================================================
# EXCLUIR UMA NOTIFICAÇÃO
# ============================================================

@notificacoes_bp.delete(
    "/<int:notificacao_id>"
)
@jwt_required()
def excluir_notificacao(notificacao_id):

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
                "Você não pode excluir "
                "esta notificação."
            )
        }), 403

    db.session.delete(notificacao)

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível excluir "
                "a notificação."
            )
        }), 500

    return jsonify({
        "mensagem": "Notificação excluída com sucesso."
    }), 200


# ============================================================
# EXCLUIR TODAS AS NOTIFICAÇÕES
# ============================================================

@notificacoes_bp.delete("")
@jwt_required()
def excluir_todas_notificacoes():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    try:
        Notificacao.query.filter_by(
            usuario_id=usuario_id
        ).delete(
            synchronize_session=False
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível excluir "
                "as notificações."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Todas as notificações foram "
            "excluídas com sucesso."
        )
    }), 200


# ============================================================
# PREFERÊNCIAS
# ============================================================

@notificacoes_bp.get(
    "/preferencias"
)
@jwt_required()
def listar_preferencias():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    try:
        preferencia = obter_ou_criar_preferencia(
            usuario_id
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível carregar "
                "as preferências."
            )
        }), 500

    return jsonify({
        "preferencias": serializar_preferencias(
            preferencia
        )
    }), 200


@notificacoes_bp.patch(
    "/preferencias"
)
@jwt_required()
def atualizar_preferencias():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    dados = request.get_json(
        silent=True
    )

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "Dados inválidos."
        }), 400

    campos_booleanos = {
        "notificacoes_push",
        "notificacoes_email",
        "solicitacoes",
        "aceitas",
        "recusadas",
        "reservas"
    }

    for campo in campos_booleanos:

        if campo in dados and not isinstance(
            dados[campo],
            bool
        ):
            return jsonify({
                "erro": (
                    f'O campo "{campo}" '
                    "deve ser booleano."
                )
            }), 400

    retencao_dias = dados.get(
        "retencao_dias"
    )

    if retencao_dias is not None:

        if isinstance(
            retencao_dias,
            bool
        ):
            return jsonify({
                "erro": (
                    '"retencao_dias" deve ser '
                    "um número inteiro."
                )
            }), 400

        try:
            retencao_dias = int(
                retencao_dias
            )

        except (
            TypeError,
            ValueError
        ):
            return jsonify({
                "erro": (
                    '"retencao_dias" deve ser '
                    "um número inteiro."
                )
            }), 400

        valores_permitidos = {
            0,
            7,
            30,
            90,
            365
        }

        if retencao_dias not in valores_permitidos:
            return jsonify({
                "erro": (
                    '"retencao_dias" deve ser '
                    "0, 7, 30, 90 ou 365."
                )
            }), 400

    try:
        preferencia = obter_ou_criar_preferencia(
            usuario_id
        )

        for campo in campos_booleanos:

            if campo in dados:
                setattr(
                    preferencia,
                    campo,
                    dados[campo]
                )

        if retencao_dias is not None:
            preferencia.retencao_dias = (
                retencao_dias
            )

        preferencia.atualizada_em = (
            datetime.utcnow()
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível salvar "
                "as preferências."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Preferências atualizadas com sucesso."
        ),
        "preferencias": serializar_preferencias(
            preferencia
        )
    }), 200


# ============================================================
# PUSH SUBSCRIPTIONS
# ============================================================

def serializar_push_subscription(
    subscription
):

    return {
        "id": subscription.id,
        "endpoint": subscription.endpoint,
        "criada_em": (
            serializar_data_notificacao(
                subscription.criada_em
            )
        ),
        "atualizada_em": (
            serializar_data_notificacao(
                subscription.atualizada_em
            )
        )
    }


@notificacoes_bp.post(
    "/push"
)
@jwt_required()
def registrar_push_subscription():

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    dados = request.get_json(
        silent=True
    )

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "Dados inválidos."
        }), 400

    endpoint = str(
        dados.get("endpoint", "")
    ).strip()

    keys = dados.get(
        "keys"
    )

    if not endpoint:
        return jsonify({
            "erro": "Endpoint da inscrição é obrigatório."
        }), 400

    if not isinstance(keys, dict):
        return jsonify({
            "erro": "Chaves da inscrição são obrigatórias."
        }), 400

    p256dh = str(
        keys.get("p256dh", "")
    ).strip()

    auth = str(
        keys.get("auth", "")
    ).strip()

    if not p256dh or not auth:
        return jsonify({
            "erro": (
                "As chaves p256dh e auth "
                "são obrigatórias."
            )
        }), 400

    try:
        subscription = PushSubscription.query.filter_by(
            endpoint=endpoint
        ).first()

        if subscription:

            if subscription.usuario_id != usuario_id:
                subscription.usuario_id = usuario_id

            subscription.p256dh = p256dh
            subscription.auth = auth
            subscription.atualizada_em = (
                datetime.utcnow()
            )

        else:

            subscription = PushSubscription(
                usuario_id=usuario_id,
                endpoint=endpoint,
                p256dh=p256dh,
                auth=auth
            )

            db.session.add(subscription)

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível registrar "
                "a inscrição de notificações."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Inscrição de notificações "
            "registrada com sucesso."
        ),
        "subscription": (
            serializar_push_subscription(
                subscription
            )
        )
    }), 201


@notificacoes_bp.delete(
    "/push/<int:subscription_id>"
)
@jwt_required()
def remover_push_subscription(
    subscription_id
):

    usuario_id = obter_usuario_id()

    if not usuario_id:
        return jsonify({
            "erro": "Usuário não identificado."
        }), 401

    subscription = db.session.get(
        PushSubscription,
        subscription_id
    )

    if not subscription:
        return jsonify({
            "erro": "Inscrição não encontrada."
        }), 404

    if subscription.usuario_id != usuario_id:
        return jsonify({
            "erro": (
                "Você não pode remover "
                "esta inscrição."
            )
        }), 403

    db.session.delete(subscription)

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível remover "
                "a inscrição."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Inscrição removida com sucesso."
        )
    }), 200
