from flask import (
    Blueprint,
    request,
    jsonify
)

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from ..extensions import db

from ..models.solicitacao import (
    Solicitacao
)

from ..models.usuario import (
    Usuario
)

from ..models.anuncio import Anuncio

from ..services.solicitacao_service import (
    criar_solicitacao_doacao,
    aceitar_solicitacao_doacao,
    recusar_solicitacao_doacao,
    cancelar_solicitacao_doacao,
    serializar_solicitacao
)


solicitacoes_bp = Blueprint(
    "solicitacoes",
    __name__,
    url_prefix="/api/solicitacoes"
)


# ============================================================
# USUÁRIO ATUAL
# ============================================================

def obter_usuario_atual():

    usuario_id = get_jwt_identity()

    try:

        usuario_id = int(
            usuario_id
        )

    except (
        TypeError,
        ValueError
    ):

        return None

    return db.session.get(
        Usuario,
        usuario_id
    )


# ============================================================
# CRIAR SOLICITAÇÃO
# ============================================================

@solicitacoes_bp.post("")
@jwt_required()
def criar_solicitacao():

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    tipo_conta = (
        get_jwt().get("tipo")
    )

    if tipo_conta != "usuario":
        return jsonify({
            "erro": (
                "Apenas usuários podem "
                "solicitar itens."
            )
        }), 403

    dados = (
        request.get_json(
            silent=True
        )
        or {}
    )

    anuncio_id = (
        dados.get("anuncio_id")
    )

    disponibilidade_id = (
        dados.get("disponibilidade_id")
    )

    if not anuncio_id:
        return jsonify({
            "erro": (
                "Anúncio não informado."
            )
        }), 400

    if not disponibilidade_id:
        return jsonify({
            "erro": (
                "Data de retirada "
                "não informada."
            )
        }), 400

    try:

        anuncio_id = int(
            anuncio_id
        )

        disponibilidade_id = int(
            disponibilidade_id
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "erro": (
                "Identificação inválida."
            )
        }), 400

    resultado, status = (
        criar_solicitacao_doacao(
            usuario=usuario,

            anuncio_id=anuncio_id,

            disponibilidade_id=(
                disponibilidade_id
            )
        )
    )

    return jsonify(
        resultado
    ), status


# ============================================================
# LISTAR SOLICITAÇÕES
# ============================================================

@solicitacoes_bp.get("")
@jwt_required()
def listar_solicitacoes():

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    recebidas = Solicitacao.query.join(
        Anuncio,
        Solicitacao.anuncio_id == Anuncio.id
    ).filter(
        Anuncio.usuario_id == usuario.id
    ).all()

    enviadas = (
        Solicitacao.query
        .filter_by(
            interessado_id=usuario.id
        )
        .all()
    )

    return jsonify({

        "recebidas": [
            serializar_solicitacao(
                solicitacao
            )

            for solicitacao
            in recebidas
        ],

        "enviadas": [
            serializar_solicitacao(
                solicitacao
            )

            for solicitacao
            in enviadas
        ]

    }), 200


# ============================================================
# DETALHES
# ============================================================

@solicitacoes_bp.get(
    "/<int:solicitacao_id>"
)
@jwt_required()
def obter_solicitacao(
    solicitacao_id
):

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    solicitacao = (
        db.session.get(
            Solicitacao,
            solicitacao_id
        )
    )

    if not solicitacao:
        return jsonify({
            "erro": (
                "Solicitação não encontrada."
            )
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
            "erro": (
                "Você não tem acesso "
                "a esta solicitação."
            )
        }), 403

    return jsonify(
        serializar_solicitacao(
            solicitacao
        )
    ), 200


# ============================================================
# ACEITAR DOAÇÃO
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/aceitar"
)
@jwt_required()
def aceitar_solicitacao(
    solicitacao_id
):

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    solicitacao = (
        db.session.get(
            Solicitacao,
            solicitacao_id
        )
    )

    if not solicitacao:
        return jsonify({
            "erro": (
                "Solicitação não encontrada."
            )
        }), 404

    resultado, status = (
        aceitar_solicitacao_doacao(
            usuario=usuario,

            solicitacao=solicitacao
        )
    )

    return jsonify(
        resultado
    ), status


# ============================================================
# RECUSAR DOAÇÃO
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/recusar"
)
@jwt_required()
def recusar_solicitacao(
    solicitacao_id
):

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    solicitacao = (
        db.session.get(
            Solicitacao,
            solicitacao_id
        )
    )

    if not solicitacao:
        return jsonify({
            "erro": (
                "Solicitação não encontrada."
            )
        }), 404

    resultado, status = (
        recusar_solicitacao_doacao(
            usuario=usuario,

            solicitacao=solicitacao
        )
    )

    return jsonify(
        resultado
    ), status


# ============================================================
# CANCELAR DOAÇÃO
# ============================================================

@solicitacoes_bp.patch(
    "/<int:solicitacao_id>/cancelar"
)
@jwt_required()
def cancelar_solicitacao(
    solicitacao_id
):

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:
        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    solicitacao = (
        db.session.get(
            Solicitacao,
            solicitacao_id
        )
    )

    if not solicitacao:
        return jsonify({
            "erro": (
                "Solicitação não encontrada."
            )
        }), 404

    resultado, status = (
        cancelar_solicitacao_doacao(
            usuario=usuario,

            solicitacao=solicitacao
        )
    )

    return jsonify(
        resultado
    ), status