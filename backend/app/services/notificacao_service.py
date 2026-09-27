from datetime import datetime

from ..extensions import db

from ..models.notificacao import (
    Notificacao
)

from ..models.preferencia_notificacao import (
    PreferenciaNotificacao
)

from ..models.usuario import (
    Usuario
)

from ..models.push_subscription import (
    PushSubscription
)

from .push_service import (
    enviar_push_usuario
)


# ============================================================
# PREFERÊNCIA PADRÃO
# ============================================================

def criar_preferencia_padrao(
    usuario_id
):

    preferencia = PreferenciaNotificacao(
        usuario_id=usuario_id
    )

    db.session.add(
        preferencia
    )

    return preferencia


# ============================================================
# OBTER OU CRIAR PREFERÊNCIA
# ============================================================

def obter_ou_criar_preferencia(
    usuario_id
):

    preferencia = (
        PreferenciaNotificacao.query
        .filter_by(
            usuario_id=usuario_id
        )
        .first()
    )

    if preferencia:
        return preferencia

    return criar_preferencia_padrao(
        usuario_id
    )


# ============================================================
# SERIALIZAR PREFERÊNCIAS
# ============================================================

def serializar_preferencias(
    preferencia
):

    return {
        "id": preferencia.id,

        "notificacoes_push": (
            preferencia.notificacoes_push
        ),

        # ----------------------------------------------------
        # Mantido para o frontend.
        #
        # Atualmente é apenas uma preferência visual.
        # O sistema ainda não envia e-mails.
        # ----------------------------------------------------

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
# SERIALIZAÇÃO
# ============================================================

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
            serializar_data_notificacao(
                notificacao.criada_em
            )
        )
    }


# ============================================================
# SERIALIZAÇÃO DE DATA
# ============================================================

def serializar_data_notificacao(
    data
):

    if not data:
        return None

    try:

        valor = data.isoformat()

    except (
        AttributeError,
        TypeError
    ):

        return None

    if data.tzinfo is None:
        return f"{valor}+00:00"

    return valor


# ============================================================
# IDENTIFICAR CATEGORIA
# ============================================================

def obter_categoria_notificacao(
    tipo
):

    tipo = str(
        tipo or ""
    ).strip()

    if tipo in {
        "doacao_solicitacao_recebida",
        "troca_solicitacao_recebida",
        "venda_solicitacao_recebida"
    }:
        return "solicitacoes"

    if tipo in {
        "doacao_aceita",
        "troca_aceita",
        "venda_aceita",
        "doacao_solicitacao_aceita"
    }:
        return "aceitas"

    if tipo in {
        "doacao_recusada",
        "troca_recusada",
        "venda_recusada",
        "doacao_solicitacao_recusada"
    }:
        return "recusadas"

    if tipo in {
        "doacao_item_reservado",
        "doacao_cancelada",
        "troca_cancelada",
        "venda_cancelada",
        "doacao_reserva",
        "troca_reserva",
        "venda_reserva"
    }:
        return "reservas"

    return None


# ============================================================
# CRIAR NOTIFICAÇÃO
# ============================================================

def criar_notificacao(
    usuario_id,
    tipo,
    titulo,
    mensagem,
    referencia_id=None,
    enviar_canais=False
):

    notificacao = Notificacao(
        usuario_id=usuario_id,

        tipo=tipo,

        titulo=titulo,

        mensagem=mensagem,

        referencia_id=referencia_id
    )

    db.session.add(
        notificacao
    )

    db.session.flush()

    if enviar_canais:

        enviar_canais_notificacao(
            notificacao
        )

    return notificacao


# ============================================================
# ENVIAR CANAIS
# ============================================================

def enviar_canais_notificacao(
    notificacao
):

    if not notificacao:
        return False

    usuario = db.session.get(
        Usuario,
        notificacao.usuario_id
    )

    if not usuario:
        return False

    preferencia = (
        obter_ou_criar_preferencia(
            usuario.id
        )
    )

    categoria = (
        obter_categoria_notificacao(
            notificacao.tipo
        )
    )

    categoria_habilitada = True

    if categoria:

        categoria_habilitada = bool(
            getattr(
                preferencia,
                categoria,
                True
            )
        )

    # --------------------------------------------------------
    # Categoria desativada
    # --------------------------------------------------------

    if not categoria_habilitada:
        notificacao.push_enviado = True

        db.session.flush()

        return False

    # --------------------------------------------------------
    # PUSH
    # --------------------------------------------------------

    if not preferencia.notificacoes_push:

        notificacao.push_enviado = True

        db.session.flush()

        return False

    # --------------------------------------------------------
    # Verificar se existe inscrição
    # --------------------------------------------------------

    possui_subscription = (
        PushSubscription.query
        .filter_by(
            usuario_id=usuario.id
        )
        .first()
        is not None
    )

    if not possui_subscription:

        notificacao.push_enviado = True

        db.session.flush()

        return False

    # --------------------------------------------------------
    # Enviar Push
    # --------------------------------------------------------

    enviado = enviar_push_usuario(

        usuario_id=usuario.id,

        titulo=(
            notificacao.titulo
        ),

        mensagem=(
            notificacao.mensagem
        ),

        referencia_id=(
            notificacao.referencia_id
        ),

        notificacao_id=(
            notificacao.id
        )
    )

    if enviado:

        notificacao.push_enviado = True

        db.session.flush()

        return True

    return False


# ============================================================
# PROCESSAR PUSH PENDENTE
# ============================================================

def processar_canais_notificacao(
    notificacao
):

    if not notificacao:
        return False

    if notificacao.push_enviado:
        return True

    return enviar_canais_notificacao(
        notificacao
    )


# ============================================================
# ATUALIZAR NOTIFICAÇÃO ORIGINAL
# ============================================================

def atualizar_notificacao_original(
    solicitacao,
    tipo,
    titulo,
    mensagem
):

    notificacao = (
        Notificacao.query
        .filter_by(
            usuario_id=(
                solicitacao.anuncio.usuario_id
            ),

            referencia_id=(
                solicitacao.id
            ),

            tipo=(
                "doacao_solicitacao_recebida"
            )
        )
        .order_by(
            Notificacao.criada_em.desc()
        )
        .first()
    )

    if not notificacao:
        return None

    notificacao.tipo = tipo

    notificacao.titulo = titulo

    notificacao.mensagem = mensagem

    notificacao.criada_em = (
        datetime.utcnow()
    )

    notificacao.lida = True

    # --------------------------------------------------------
    # Como o conteúdo mudou, o Push precisa ser enviado
    # novamente.
    # --------------------------------------------------------

    notificacao.push_enviado = False

    db.session.flush()

    return notificacao


# ============================================================
# MARCAR COMO LIDA
# ============================================================

def marcar_notificacao_como_lida(
    notificacao
):

    notificacao.lida = True

    db.session.commit()


# ============================================================
# MARCAR TODAS COMO LIDAS
# ============================================================

def marcar_todas_como_lidas(
    usuario_id
):

    (
        Notificacao.query
        .filter_by(
            usuario_id=usuario_id,
            lida=False
        )
        .update(
            {
                "lida": True
            },
            synchronize_session=False
        )
    )

    db.session.commit()


# ============================================================
# EXCLUIR NOTIFICAÇÃO
# ============================================================

def excluir_notificacao(
    notificacao
):

    db.session.delete(
        notificacao
    )

    db.session.commit()


# ============================================================
# EXCLUIR TODAS
# ============================================================

def excluir_todas_notificacoes(
    usuario_id
):

    (
        Notificacao.query
        .filter_by(
            usuario_id=usuario_id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.session.commit()