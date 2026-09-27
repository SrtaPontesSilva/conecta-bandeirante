import os


# ============================================================
# CONFIGURAÇÃO VAPID
# ============================================================

def obter_configuracao_vapid():

    return {
        "public_key": os.getenv(
            "VAPID_PUBLIC_KEY",
            ""
        ).strip(),

        "private_key": os.getenv(
            "VAPID_PRIVATE_KEY",
            ""
        ).strip(),

        "subject": os.getenv(
            "VAPID_SUBJECT",
            ""
        ).strip()
    }


# ============================================================
# VERIFICAR CONFIGURAÇÃO
# ============================================================

def push_configurado():

    configuracao = (
        obter_configuracao_vapid()
    )

    return bool(
        configuracao["public_key"]
        and configuracao["private_key"]
        and configuracao["subject"]
    )


# ============================================================
# ENVIAR PUSH PARA UMA INSCRIÇÃO
# ============================================================

def enviar_push_subscription(
    subscription,
    titulo,
    mensagem,
    referencia_id=None,
    notificacao_id=None
):

    if not subscription:
        return False

    if not push_configurado():

        print(
            "[PUSH] VAPID não configurado."
        )

        return False

    try:

        from pywebpush import (
            webpush,
            WebPushException
        )

    except ImportError:

        print(
            "[PUSH] pywebpush não está instalado."
        )

        return False

    configuracao = (
        obter_configuracao_vapid()
    )

    payload = {

        "title": str(
            titulo or
            "Conecta Bandeirante"
        ),

        "body": str(
            mensagem or
            ""
        ),

        "data": {

            "notificacao_id": (
                notificacao_id
            ),

            "referencia_id": (
                referencia_id
            ),

            "url": (
                f"/notificacoes"
                f"?solicitacao={referencia_id}"
                if referencia_id
                else "/"
            )
        }
    }

    subscription_info = {

        "endpoint": (
            subscription.endpoint
        ),

        "keys": {

            "p256dh": (
                subscription.p256dh
            ),

            "auth": (
                subscription.auth
            )
        }
    }

    try:

        webpush(

            subscription_info=(
                subscription_info
            ),

            data=__import__(
                "json"
            ).dumps(
                payload,
                ensure_ascii=False
            ),

            vapid_private_key=(
                configuracao["private_key"]
            ),

            vapid_claims={
                "sub": (
                    configuracao["subject"]
                )
            }
        )

        print(
            "[PUSH] Notificação enviada."
        )

        return True

    except WebPushException as erro:

        print(
            f"[PUSH] Falha no envio: {erro}"
        )

        return False

    except Exception as erro:

        print(
            f"[PUSH] Erro inesperado: {erro}"
        )

        return False


# ============================================================
# ENVIAR PUSH PARA USUÁRIO
# ============================================================

def enviar_push_usuario(
    usuario_id,
    titulo,
    mensagem,
    referencia_id=None,
    notificacao_id=None
):

    from ..models.push_subscription import (
        PushSubscription
    )

    subscriptions = (
        PushSubscription.query
        .filter_by(
            usuario_id=usuario_id
        )
        .all()
    )

    if not subscriptions:

        return False

    enviadas = 0

    for subscription in subscriptions:

        enviado = enviar_push_subscription(

            subscription=subscription,

            titulo=titulo,

            mensagem=mensagem,

            referencia_id=referencia_id,

            notificacao_id=notificacao_id
        )

        if enviado:

            enviadas += 1

    return enviadas > 0