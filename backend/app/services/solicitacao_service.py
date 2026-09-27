from datetime import datetime

from sqlalchemy import update

from ..extensions import db

from ..models.anuncio import (
    Anuncio,
    AnuncioDisponibilidade
)

from ..models.solicitacao import (
    Solicitacao
)

from .notificacao_service import (
    criar_notificacao,
    atualizar_notificacao_original
)


# ============================================================
# NOME DO USUÁRIO
# ============================================================

def nome_usuario(
    usuario
):

    if not usuario:
        return "Usuário"

    nome = usuario.nome or ""

    sobrenome = (
        usuario.sobrenome or ""
    )

    nome_completo = (
        f"{nome} {sobrenome}"
    ).strip()

    return (
        nome_completo
        or "Usuário"
    )


# ============================================================
# SERIALIZAÇÃO
# ============================================================

def serializar_solicitacao(
    solicitacao
):

    anuncio = (
        solicitacao.anuncio
    )

    interessado = (
        solicitacao.interessado
    )

    disponibilidade = (
        solicitacao.disponibilidade
    )

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
            "nome": nome_usuario(
                interessado
            )
        },

        "disponibilidade": {
            "id": disponibilidade.id,
            "data": (
                disponibilidade.data.isoformat()
            ),
            "status": disponibilidade.status
        }
    }


# ============================================================
# CRIAR SOLICITAÇÃO DE DOAÇÃO
# ============================================================

def criar_solicitacao_doacao(
    usuario,
    anuncio_id,
    disponibilidade_id
):

    anuncio = db.session.get(
        Anuncio,
        anuncio_id
    )

    if not anuncio:
        return {
            "erro": "Anúncio não encontrado."
        }, 404

    if anuncio.modalidade != "doacao":
        return {
            "erro": (
                "Este anúncio não está disponível "
                "para doação."
            )
        }, 400

    if anuncio.status != "disponivel":
        return {
            "erro": (
                "Este item não está mais disponível."
            )
        }, 409

    # --------------------------------------------------------
    # PRÓPRIO ITEM
    # --------------------------------------------------------

    if anuncio.usuario_id == usuario.id:
        return {
            "erro": (
                "Você não pode demonstrar interesse "
                "no seu próprio anúncio."
            )
        }, 400

    # --------------------------------------------------------
    # DISPONIBILIDADE
    # --------------------------------------------------------

    disponibilidade = db.session.get(
        AnuncioDisponibilidade,
        disponibilidade_id
    )

    if not disponibilidade:
        return {
            "erro": (
                "Data de retirada não encontrada."
            )
        }, 404

    if disponibilidade.anuncio_id != anuncio.id:
        return {
            "erro": (
                "A data selecionada não pertence "
                "a este anúncio."
            )
        }, 400

    if disponibilidade.status != "disponivel":
        return {
            "erro": (
                "Esta data não está mais disponível."
            )
        }, 409

    # --------------------------------------------------------
    # DUPLICADA
    # --------------------------------------------------------

    solicitacao_existente = (
        Solicitacao.query
        .filter(
            Solicitacao.anuncio_id == anuncio.id,

            Solicitacao.interessado_id == usuario.id,

            Solicitacao.status.in_([
                "pendente",
                "aceita"
            ])
        )
        .first()
    )

    if solicitacao_existente:
        return {
            "erro": (
                "Você já possui uma solicitação "
                "ativa para este item."
            )
        }, 409

    # --------------------------------------------------------
    # CRIAR
    # --------------------------------------------------------

    solicitacao = Solicitacao(
        anuncio_id=anuncio.id,

        interessado_id=usuario.id,

        disponibilidade_id=(
            disponibilidade.id
        ),

        tipo="doacao",

        status="pendente"
    )

    db.session.add(
        solicitacao
    )

    try:

        db.session.flush()

        nome_interessado = (
            nome_usuario(usuario)
        )

        criar_notificacao(
            usuario_id=(
                anuncio.usuario_id
            ),

            tipo=(
                "doacao_solicitacao_recebida"
            ),

            titulo=(
                "Nova solicitação de doação"
            ),

            mensagem=(
                f"{nome_interessado} demonstrou "
                f"interesse no item "
                f'"{anuncio.titulo}" e solicitou '
                f"a retirada em "
                f"{disponibilidade.data.strftime('%d/%m/%Y')}."
            ),

            referencia_id=(
                solicitacao.id
            )
        )

        db.session.commit()

    except Exception:

        db.session.rollback()

        return {
            "erro": (
                "Não foi possível registrar "
                "sua solicitação."
            )
        }, 500

    return {
        "mensagem": (
            "Seu interesse foi enviado "
            "com sucesso."
        ),

        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }, 201


# ============================================================
# ACEITAR DOAÇÃO
# ============================================================

def aceitar_solicitacao_doacao(
    usuario,
    solicitacao
):

    anuncio = (
        solicitacao.anuncio
    )

    if anuncio.usuario_id != usuario.id:
        return {
            "erro": (
                "Apenas o responsável pelo anúncio "
                "pode aceitar esta solicitação."
            )
        }, 403

    if solicitacao.tipo != "doacao":
        return {
            "erro": (
                "Esta solicitação não pertence "
                "ao fluxo de doação."
            )
        }, 400

    if solicitacao.status != "pendente":
        return {
            "erro": (
                "Esta solicitação não está mais pendente."
            )
        }, 409

    disponibilidade_id = (
        solicitacao.disponibilidade_id
    )

    # --------------------------------------------------------
    # RESERVA ATÔMICA
    # --------------------------------------------------------

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

        return {
            "erro": (
                "A data selecionada não está "
                "mais disponível."
            )
        }, 409

    # --------------------------------------------------------
    # ANÚNCIO
    # --------------------------------------------------------

    if anuncio.status != "disponivel":

        db.session.rollback()

        return {
            "erro": (
                "Este item não está mais disponível."
            )
        }, 409

    # --------------------------------------------------------
    # ACEITAR
    # --------------------------------------------------------

    solicitacao.status = "aceita"

    anuncio.status = "reservado"

    # --------------------------------------------------------
    # RECUSAR OUTRAS
    # --------------------------------------------------------

    outras_solicitacoes = (
        Solicitacao.query
        .filter(
            Solicitacao.anuncio_id == anuncio.id,

            Solicitacao.id != solicitacao.id,

            Solicitacao.status == "pendente"
        )
        .all()
    )

    for outra in outras_solicitacoes:

        outra.status = "recusada"

        criar_notificacao(
            usuario_id=(
                outra.interessado_id
            ),

            tipo=(
                "doacao_item_reservado"
            ),

            titulo=(
                "Item já reservado"
            ),

            mensagem=(
                f'O item "{anuncio.titulo}" '
                "foi reservado para outra pessoa. "
                "Sua solicitação de doação foi "
                "encerrada."
            ),

            referencia_id=(
                outra.id
            )
        )

    # --------------------------------------------------------
    # NOTIFICAÇÃO ORIGINAL
    # --------------------------------------------------------

    atualizar_notificacao_original(
        solicitacao=solicitacao,

        tipo=(
            "doacao_solicitacao_aceita"
        ),

        titulo=(
            "Proposta aceita"
        ),

        mensagem=(
            f'Você aceitou a solicitação de retirada '
            f'do item "{anuncio.titulo}" por '
            f'{nome_usuario(solicitacao.interessado)}.'
        )
    )

    # --------------------------------------------------------
    # NOTIFICA INTERESSADO
    # --------------------------------------------------------

    disponibilidade = (
        solicitacao.disponibilidade
    )

    criar_notificacao(
        usuario_id=(
            solicitacao.interessado_id
        ),

        tipo="doacao_aceita",

        titulo="Proposta aceita",

        mensagem=(
            f'Sua proposta para receber '
            f'"{anuncio.titulo}" foi aceita. '
            f"A retirada está reservada para "
            f"{disponibilidade.data.strftime('%d/%m/%Y')}."
        ),

        referencia_id=(
            solicitacao.id
        )
    )

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return {
            "erro": (
                "Não foi possível confirmar "
                "a doação."
            )
        }, 500

    return {
        "mensagem": (
            "Solicitação de doação aceita "
            "e item reservado."
        ),

        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }, 200


# ============================================================
# RECUSAR DOAÇÃO
# ============================================================

def recusar_solicitacao_doacao(
    usuario,
    solicitacao
):

    anuncio = (
        solicitacao.anuncio
    )

    if anuncio.usuario_id != usuario.id:
        return {
            "erro": (
                "Apenas o responsável pelo anúncio "
                "pode recusar esta solicitação."
            )
        }, 403

    if solicitacao.tipo != "doacao":
        return {
            "erro": (
                "Esta solicitação não pertence "
                "ao fluxo de doação."
            )
        }, 400

    if solicitacao.status != "pendente":
        return {
            "erro": (
                "Esta solicitação não está mais pendente."
            )
        }, 409

    solicitacao.status = "recusada"

    atualizar_notificacao_original(
        solicitacao=solicitacao,

        tipo=(
            "doacao_solicitacao_recusada"
        ),

        titulo=(
            "Proposta recusada"
        ),

        mensagem=(
            f'Você recusou a solicitação de retirada '
            f'do item "{anuncio.titulo}" por '
            f'{nome_usuario(solicitacao.interessado)}.'
        )
    )

    criar_notificacao(
        usuario_id=(
            solicitacao.interessado_id
        ),

        tipo="doacao_recusada",

        titulo="Proposta recusada",

        mensagem=(
            f'Sua proposta para receber '
            f'"{anuncio.titulo}" foi recusada.'
        ),

        referencia_id=(
            solicitacao.id
        )
    )

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return {
            "erro": (
                "Não foi possível recusar "
                "a solicitação."
            )
        }, 500

    return {
        "mensagem": (
            "Solicitação de doação recusada."
        ),

        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }, 200


# ============================================================
# CANCELAR DOAÇÃO
# ============================================================

def cancelar_solicitacao_doacao(
    usuario,
    solicitacao
):

    anuncio = (
        solicitacao.anuncio
    )

    eh_interessado = (
        solicitacao.interessado_id ==
        usuario.id
    )

    eh_dono = (
        anuncio.usuario_id ==
        usuario.id
    )

    if not eh_interessado and not eh_dono:
        return {
            "erro": (
                "Você não pode cancelar "
                "esta solicitação."
            )
        }, 403

    if solicitacao.tipo != "doacao":
        return {
            "erro": (
                "Esta solicitação não pertence "
                "ao fluxo de doação."
            )
        }, 400

    if solicitacao.status not in [
        "pendente",
        "aceita"
    ]:
        return {
            "erro": (
                "Esta solicitação não pode "
                "mais ser cancelada."
            )
        }, 409

    estava_aceita = (
        solicitacao.status ==
        "aceita"
    )

    solicitacao.status = "cancelada"

    if (
        estava_aceita
        and anuncio.status == "reservado"
    ):

        anuncio.status = "disponivel"

        solicitacao.disponibilidade.status = (
            "disponivel"
        )

    destinatario_id = (
        anuncio.usuario_id
        if eh_interessado
        else solicitacao.interessado_id
    )

    nome_cancelador = (
        nome_usuario(usuario)
    )

    criar_notificacao(
        usuario_id=destinatario_id,

        tipo="doacao_cancelada",

        titulo="Doação cancelada",

        mensagem=(
            f'{nome_cancelador} cancelou '
            f'a solicitação do item '
            f'"{anuncio.titulo}".'
        ),

        referencia_id=(
            solicitacao.id
        )
    )

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return {
            "erro": (
                "Não foi possível cancelar "
                "a solicitação."
            )
        }, 500

    return {
        "mensagem": (
            "Solicitação de doação cancelada."
        ),

        "solicitacao": (
            serializar_solicitacao(
                solicitacao
            )
        )
    }, 200