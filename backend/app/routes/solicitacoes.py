from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from sqlalchemy import update

from ..extensions import db

from ..models.anuncio import (
    Anuncio,
    AnuncioDisponibilidade
)

from ..models.solicitacao import (
    Solicitacao
)

from ..models.notificacao import (
    Notificacao
)

from ..models.usuario import Usuario


solicitacoes_bp = Blueprint(
    "solicitacoes",
    __name__,
    url_prefix="/api/solicitacoes"
)


def obter_usuario_atual():
    usuario_id = get_jwt_identity()

    try:
        usuario_id = int(usuario_id)

    except (TypeError, ValueError):
        return None

    return db.session.get(
        Usuario,
        usuario_id
    )


def nome_usuario(usuario):
    if not usuario:
        return "Usuário"

    nome = usuario.nome or ""
    sobrenome = usuario.sobrenome or ""

    nome_completo = (
        f"{nome} {sobrenome}"
    ).strip()

    return nome_completo or "Usuário"


def serializar_solicitacao(solicitacao):
    anuncio = solicitacao.anuncio
    interessado = solicitacao.interessado
    disponibilidade = solicitacao.disponibilidade

    return {
        "id": solicitacao.id,

        "tipo": solicitacao.tipo,

        "status": solicitacao.status,

        "criado_em": (
            solicitacao.criado_em.isoformat()
            if solicitacao.criado_em
            else None
        ),

        "atualizado_em": (
            solicitacao.atualizado_em.isoformat()
            if solicitacao.atualizado_em
            else None
        ),

        "anuncio": {
            "id": anuncio.id,
            "titulo": anuncio.titulo,
            "modalidade": anuncio.modalidade,
            "status": anuncio.status
        },

        "interessado": {
            "id": interessado.id,
            "nome": nome_usuario(interessado)
        },

        "disponibilidade": {
            "id": disponibilidade.id,
            "data": disponibilidade.data.isoformat(),
            "status": disponibilidade.status
        }
    }


def criar_notificacao(
    usuario_id,
    tipo,
    titulo,
    mensagem,
    referencia_id=None
):
    notificacao = Notificacao(
        usuario_id=usuario_id,
        tipo=tipo,
        titulo=titulo,
        mensagem=mensagem,
        referencia_id=referencia_id
    )

    db.session.add(notificacao)

    return notificacao


# ============================================================
# CRIAR SOLICITAÇÃO DE DOAÇÃO
# ============================================================

@solicitacoes_bp.post("")
@jwt_required()
def criar_solicitacao():

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    tipo_conta = get_jwt().get("tipo")

    if tipo_conta != "usuario":
        return jsonify({
            "erro": "Apenas usuários podem solicitar itens."
        }), 403

    dados = request.get_json(
        silent=True
    ) or {}

    anuncio_id = dados.get(
        "anuncio_id"
    )

    disponibilidade_id = dados.get(
        "disponibilidade_id"
    )

    if not anuncio_id:
        return jsonify({
            "erro": "Anúncio não informado."
        }), 400

    if not disponibilidade_id:
        return jsonify({
            "erro": "Data de retirada não informada."
        }), 400

    try:
        anuncio_id = int(anuncio_id)
        disponibilidade_id = int(
            disponibilidade_id
        )

    except (TypeError, ValueError):
        return jsonify({
            "erro": "Identificação inválida."
        }), 400

    # ========================================================
    # ANÚNCIO
    # ========================================================

    anuncio = db.session.get(
        Anuncio,
        anuncio_id
    )

    if not anuncio:
        return jsonify({
            "erro": "Anúncio não encontrado."
        }), 404

    if anuncio.modalidade != "doacao":
        return jsonify({
            "erro": (
                "Este anúncio não está disponível "
                "para doação."
            )
        }), 400

    if anuncio.status != "disponivel":
        return jsonify({
            "erro": (
                "Este item não está mais disponível."
            )
        }), 409

    # ========================================================
    # NÃO PODE SOLICITAR O PRÓPRIO ITEM
    # ========================================================

    if anuncio.usuario_id == usuario.id:
        return jsonify({
            "erro": (
                "Você não pode demonstrar interesse "
                "no seu próprio anúncio."
            )
        }), 400

    # ========================================================
    # DISPONIBILIDADE
    # ========================================================

    disponibilidade = db.session.get(
        AnuncioDisponibilidade,
        disponibilidade_id
    )

    if not disponibilidade:
        return jsonify({
            "erro": "Data de retirada não encontrada."
        }), 404

    if disponibilidade.anuncio_id != anuncio.id:
        return jsonify({
            "erro": (
                "A data selecionada não pertence "
                "a este anúncio."
            )
        }), 400

    if disponibilidade.status != "disponivel":
        return jsonify({
            "erro": (
                "Esta data não está mais disponível."
            )
        }), 409

    # ========================================================
    # SOLICITAÇÃO DUPLICADA
    # ========================================================

    solicitacao_existente = Solicitacao.query.filter(
        Solicitacao.anuncio_id == anuncio.id,
        Solicitacao.interessado_id == usuario.id,
        Solicitacao.status.in_([
            "pendente",
            "aceita"
        ])
    ).first()

    if solicitacao_existente:
        return jsonify({
            "erro": (
                "Você já possui uma solicitação "
                "ativa para este item."
            )
        }), 409

    # ========================================================
    # CRIA SOLICITAÇÃO
    # ========================================================

    solicitacao = Solicitacao(
        anuncio_id=anuncio.id,
        interessado_id=usuario.id,
        disponibilidade_id=disponibilidade.id,
        tipo="doacao",
        status="pendente"
    )

    db.session.add(
        solicitacao
    )

    try:
        db.session.flush()

        nome_interessado = nome_usuario(
            usuario
        )

        criar_notificacao(
            usuario_id=anuncio.usuario_id,
            tipo="interesse_recebido",
            titulo="Novo interesse no seu item",
            mensagem=(
                f"{nome_interessado} demonstrou "
                f"interesse no seu item "
                f'"{anuncio.titulo}" e solicitou '
                f"a data "
                f"{disponibilidade.data.strftime('%d/%m/%Y')}."
            ),
            referencia_id=solicitacao.id
        )

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível registrar "
                "sua solicitação."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Seu interesse foi enviado "
            "com sucesso."
        ),
        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }), 201


# ============================================================
# LISTAR SOLICITAÇÕES DO USUÁRIO
# ============================================================

@solicitacoes_bp.get("")
@jwt_required()
def listar_solicitacoes():

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    recebidas = Solicitacao.query.join(
        Anuncio,
        Solicitacao.anuncio_id == Anuncio.id
    ).filter(
        Anuncio.usuario_id == usuario.id
    ).all()

    enviadas = Solicitacao.query.filter_by(
        interessado_id=usuario.id
    ).all()

    return jsonify({
        "recebidas": [
            serializar_solicitacao(
                solicitacao
            )
            for solicitacao in recebidas
        ],

        "enviadas": [
            serializar_solicitacao(
                solicitacao
            )
            for solicitacao in enviadas
        ]
    }), 200


# ============================================================
# DETALHES
# ============================================================

@solicitacoes_bp.get("/<int:solicitacao_id>")
@jwt_required()
def obter_solicitacao(solicitacao_id):

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    solicitacao = db.session.get(
        Solicitacao,
        solicitacao_id
    )

    if not solicitacao:
        return jsonify({
            "erro": "Solicitação não encontrada."
        }), 404

    eh_interessado = (
        solicitacao.interessado_id ==
        usuario.id
    )

    eh_dono = (
        solicitacao.anuncio.usuario_id ==
        usuario.id
    )

    if not eh_interessado and not eh_dono:
        return jsonify({
            "erro": "Você não tem acesso a esta solicitação."
        }), 403

    return jsonify(
        serializar_solicitacao(
            solicitacao
        )
    ), 200


# ============================================================
# ACEITAR
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/aceitar"
)
@jwt_required()
def aceitar_solicitacao(
    solicitacao_id
):

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    solicitacao = db.session.get(
        Solicitacao,
        solicitacao_id
    )

    if not solicitacao:
        return jsonify({
            "erro": "Solicitação não encontrada."
        }), 404

    anuncio = solicitacao.anuncio

    # ========================================================
    # SOMENTE DONO
    # ========================================================

    if anuncio.usuario_id != usuario.id:
        return jsonify({
            "erro": (
                "Apenas o responsável pelo anúncio "
                "pode aceitar esta solicitação."
            )
        }), 403

    if solicitacao.tipo != "doacao":
        return jsonify({
            "erro": (
                "Esta solicitação não pertence "
                "ao fluxo de doação."
            )
        }), 400

    if solicitacao.status != "pendente":
        return jsonify({
            "erro": (
                "Esta solicitação não está mais pendente."
            )
        }), 409

    disponibilidade_id = (
        solicitacao.disponibilidade_id
    )

    # ========================================================
    # RESERVA ATÔMICA DA DATA
    # ========================================================

    resultado = db.session.execute(
        update(
            AnuncioDisponibilidade
        )
        .where(
            AnuncioDisponibilidade.id ==
            disponibilidade_id,

            AnuncioDisponibilidade.status ==
            "disponivel"
        )
        .values(
            status="reservada"
        )
    )

    if resultado.rowcount != 1:
        db.session.rollback()

        return jsonify({
            "erro": (
                "A data selecionada não está "
                "mais disponível."
            )
        }), 409

    # ========================================================
    # VERIFICA SE O ITEM AINDA ESTÁ DISPONÍVEL
    # ========================================================

    if anuncio.status != "disponivel":

        db.session.rollback()

        return jsonify({
            "erro": (
                "Este item não está mais disponível."
            )
        }), 409

    # ========================================================
    # ACEITA SOLICITAÇÃO
    # ========================================================

    solicitacao.status = "aceita"

    anuncio.status = "reservado"

    # ========================================================
    # RECUSA OUTRAS SOLICITAÇÕES PENDENTES
    # ========================================================

    outras_solicitacoes = Solicitacao.query.filter(
        Solicitacao.anuncio_id == anuncio.id,
        Solicitacao.id != solicitacao.id,
        Solicitacao.status == "pendente"
    ).all()

    for outra in outras_solicitacoes:

        outra.status = "recusada"

        criar_notificacao(
            usuario_id=outra.interessado_id,
            tipo="interesse_recusado",
            titulo="Item reservado",
            mensagem=(
                f'O item "{anuncio.titulo}" '
                "foi reservado para outra pessoa."
            ),
            referencia_id=outra.id
        )

    # ========================================================
    # NOTIFICA INTERESSADO
    # ========================================================

    disponibilidade = (
        solicitacao.disponibilidade
    )

    criar_notificacao(
        usuario_id=solicitacao.interessado_id,
        tipo="reserva_confirmada",
        titulo="Reserva confirmada",
        mensagem=(
            f'A sua solicitação para '
            f'"{anuncio.titulo}" foi aceita. '
            f"A retirada está reservada para "
            f"{disponibilidade.data.strftime('%d/%m/%Y')}."
        ),
        referencia_id=solicitacao.id
    )

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível confirmar "
                "a reserva."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Solicitação aceita e item reservado."
        ),
        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }), 200


# ============================================================
# RECUSAR
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/recusar"
)
@jwt_required()
def recusar_solicitacao(
    solicitacao_id
):

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    solicitacao = db.session.get(
        Solicitacao,
        solicitacao_id
    )

    if not solicitacao:
        return jsonify({
            "erro": "Solicitação não encontrada."
        }), 404

    anuncio = solicitacao.anuncio

    if anuncio.usuario_id != usuario.id:
        return jsonify({
            "erro": (
                "Apenas o responsável pelo anúncio "
                "pode recusar esta solicitação."
            )
        }), 403

    if solicitacao.status != "pendente":
        return jsonify({
            "erro": (
                "Esta solicitação não está mais pendente."
            )
        }), 409

    solicitacao.status = "recusada"

    criar_notificacao(
        usuario_id=solicitacao.interessado_id,
        tipo="interesse_recusado",
        titulo="Solicitação recusada",
        mensagem=(
            f'A sua solicitação para '
            f'"{anuncio.titulo}" foi recusada.'
        ),
        referencia_id=solicitacao.id
    )

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível recusar "
                "a solicitação."
            )
        }), 500

    return jsonify({
        "mensagem": (
            "Solicitação recusada."
        ),
        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }), 200


# ============================================================
# CANCELAR
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/cancelar"
)
@jwt_required()
def cancelar_solicitacao(
    solicitacao_id
):

    usuario = obter_usuario_atual()

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado."
        }), 404

    solicitacao = db.session.get(
        Solicitacao,
        solicitacao_id
    )

    if not solicitacao:
        return jsonify({
            "erro": "Solicitação não encontrada."
        }), 404

    anuncio = solicitacao.anuncio

    eh_interessado = (
        solicitacao.interessado_id ==
        usuario.id
    )

    eh_dono = (
        anuncio.usuario_id ==
        usuario.id
    )

    if not eh_interessado and not eh_dono:
        return jsonify({
            "erro": (
                "Você não pode cancelar "
                "esta solicitação."
            )
        }), 403

    if solicitacao.status not in [
        "pendente",
        "aceita"
    ]:
        return jsonify({
            "erro": (
                "Esta solicitação não pode "
                "mais ser cancelada."
            )
        }), 409

    estava_aceita = (
        solicitacao.status == "aceita"
    )

    solicitacao.status = "cancelada"

    # ========================================================
    # SE ESTAVA ACEITA, LIBERA ITEM E DATA
    # ========================================================

    if (
        estava_aceita
        and anuncio.status == "reservado"
    ):
        anuncio.status = "disponivel"

        solicitacao.disponibilidade.status = (
            "disponivel"
        )

    # ========================================================
    # NOTIFICA A OUTRA PESSOA
    # ========================================================

    destinatario_id = (
        anuncio.usuario_id
        if eh_interessado
        else solicitacao.interessado_id
    )

    nome_cancelador = nome_usuario(
        usuario
    )

    criar_notificacao(
        usuario_id=destinatario_id,
        tipo="reserva_cancelada",
        titulo="Reserva cancelada",
        mensagem=(
            f'{nome_cancelador} cancelou '
            f'a solicitação do item '
            f'"{anuncio.titulo}".'
        ),
        referencia_id=solicitacao.id
    )

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": (
                "Não foi possível cancelar "
                "a solicitação."
            )
        }), 500

    return jsonify({
        "mensagem": "Solicitação cancelada.",
        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }), 200