import re

import cloudinary.uploader

from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from werkzeug.security import (
    generate_password_hash
)

from ..extensions import db
from ..models.usuario import Usuario


usuarios_bp = Blueprint(
    "usuarios",
    __name__,
    url_prefix="/api/usuarios"
)


# ============================================================
# CONFIGURAÇÕES
# ============================================================

TAMANHO_MAXIMO_IMAGEM = 4 * 1024 * 1024

TIPOS_IMAGEM_PERMITIDOS = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


EXTENSOES_IMAGEM_PERMITIDAS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}


PASTA_CLOUDINARY_PERFIL = (
    "conecta-bandeirante/perfis"
)


# ============================================================
# CPF
# ============================================================

def cpf_valido(cpf):

    cpf = re.sub(
        r"\D",
        "",
        cpf or ""
    )

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    # --------------------------------------------------------
    # Primeiro dígito verificador
    # --------------------------------------------------------

    soma = sum(
        int(cpf[i]) * (10 - i)
        for i in range(9)
    )

    resto = soma % 11

    digito1 = (
        0
        if resto < 2
        else 11 - resto
    )

    if int(cpf[9]) != digito1:
        return False

    # --------------------------------------------------------
    # Segundo dígito verificador
    # --------------------------------------------------------

    soma = sum(
        int(cpf[i]) * (11 - i)
        for i in range(10)
    )

    resto = soma % 11

    digito2 = (
        0
        if resto < 2
        else 11 - resto
    )

    return int(cpf[10]) == digito2


# ============================================================
# USUÁRIO ATUAL
# ============================================================

def obter_usuario_atual():

    usuario_id = get_jwt_identity()

    try:
        usuario_id = int(usuario_id)

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
# NOME COMPLETO
# ============================================================

def nome_completo_usuario(usuario):

    if not usuario:
        return "Usuário"

    nome = (
        usuario.nome or ""
    ).strip()

    sobrenome = (
        usuario.sobrenome or ""
    ).strip()

    nome_completo = (
        f"{nome} {sobrenome}"
    ).strip()

    return (
        nome_completo
        or "Usuário"
    )


# ============================================================
# SERIALIZAÇÃO DO USUÁRIO
# ============================================================

def serializar_usuario(usuario):

    return {
        "id": usuario.id,

        "nome": usuario.nome,

        "sobrenome": usuario.sobrenome,

        "nome_completo": (
            nome_completo_usuario(
                usuario
            )
        ),

        "email": usuario.email,

        "cpf": usuario.cpf,

        "imagem_perfil": (
            usuario.imagem_perfil
            if usuario.imagem_perfil
            else None
        )
    }


# ============================================================
# VALIDAR IMAGEM
# ============================================================

def imagem_valida(arquivo):

    if not arquivo:
        return False

    # --------------------------------------------------------
    # MIME TYPE
    # --------------------------------------------------------

    if arquivo.mimetype not in TIPOS_IMAGEM_PERMITIDOS:
        return False

    # --------------------------------------------------------
    # EXTENSÃO
    # --------------------------------------------------------

    nome_arquivo = (
        arquivo.filename or ""
    ).lower()

    extensao_valida = any(
        nome_arquivo.endswith(
            extensao
        )
        for extensao
        in EXTENSOES_IMAGEM_PERMITIDAS
    )

    if not extensao_valida:
        return False

    # --------------------------------------------------------
    # TAMANHO
    # --------------------------------------------------------

    tamanho = arquivo.content_length

    if tamanho is None:

        try:
            posicao_atual = (
                arquivo.stream.tell()
            )

            arquivo.stream.seek(
                0,
                2
            )

            tamanho = (
                arquivo.stream.tell()
            )

            arquivo.stream.seek(
                posicao_atual
            )

        except (
            OSError,
            AttributeError
        ):
            tamanho = None

    if (
        tamanho is not None
        and tamanho > TAMANHO_MAXIMO_IMAGEM
    ):
        return False

    return True


# ============================================================
# PUBLIC ID DA FOTO DE PERFIL
# ============================================================

def public_id_imagem_perfil(
    usuario_id
):

    return (
        f"{PASTA_CLOUDINARY_PERFIL}"
        f"/usuario_{usuario_id}"
    )


# ============================================================
# EXCLUIR FOTO DO CLOUDINARY
# ============================================================

def excluir_imagem_perfil_cloudinary(
    usuario_id
):

    public_id = (
        public_id_imagem_perfil(
            usuario_id
        )
    )

    try:

        cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            invalidate=True
        )

    except Exception as error:

        # A exclusão do arquivo no Cloudinary
        # não deve impedir a atualização do banco.
        print(
            "Aviso: não foi possível "
            "remover a imagem anterior "
            f"do Cloudinary: {error}"
        )


# ============================================================
# CADASTRAR USUÁRIO
# ============================================================

@usuarios_bp.post("")
def cadastrar_usuario():

    dados = request.get_json(
        silent=True
    )

    if not dados:

        return jsonify({
            "erro": "Dados não enviados."
        }), 400

    nome = (
        dados.get(
            "nome",
            ""
        )
        .strip()
    )

    sobrenome = (
        dados.get(
            "sobrenome",
            ""
        )
        .strip()
    )

    email = (
        dados.get(
            "email",
            ""
        )
        .strip()
        .lower()
    )

    cpf = re.sub(
        r"\D",
        "",
        dados.get(
            "cpf",
            ""
        )
    )

    senha = dados.get(
        "senha",
        ""
    )

    # --------------------------------------------------------
    # CAMPOS OBRIGATÓRIOS
    # --------------------------------------------------------

    if not nome or not sobrenome:

        return jsonify({
            "erro": (
                "Nome e sobrenome "
                "são obrigatórios."
            )
        }), 400

    if not email:

        return jsonify({
            "erro": (
                "E-mail é obrigatório."
            )
        }), 400

    if not cpf_valido(cpf):

        return jsonify({
            "erro": "CPF inválido."
        }), 400

    if len(senha) < 8:

        return jsonify({
            "erro": (
                "A senha deve possuir "
                "pelo menos 8 caracteres."
            )
        }), 400

    # --------------------------------------------------------
    # DUPLICIDADE
    # --------------------------------------------------------

    if Usuario.query.filter_by(
        email=email
    ).first():

        return jsonify({
            "erro": (
                "Este e-mail já está "
                "cadastrado."
            )
        }), 409

    if Usuario.query.filter_by(
        cpf=cpf
    ).first():

        return jsonify({
            "erro": (
                "Este CPF já está "
                "cadastrado."
            )
        }), 409

    # --------------------------------------------------------
    # CRIAR USUÁRIO
    # --------------------------------------------------------

    usuario = Usuario(
        nome=nome,

        sobrenome=sobrenome,

        email=email,

        cpf=cpf,

        senha_hash=(
            generate_password_hash(
                senha
            )
        ),

        imagem_perfil=None
    )

    try:

        db.session.add(
            usuario
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Erro ao cadastrar usuário:",
            error
        )

        return jsonify({
            "erro": (
                "Não foi possível "
                "cadastrar o usuário."
            )
        }), 500

    # --------------------------------------------------------
    # RESPOSTA
    # --------------------------------------------------------

    return jsonify({

        "mensagem": (
            "Usuário cadastrado "
            "com sucesso."
        ),

        "usuario": (
            serializar_usuario(
                usuario
            )
        )

    }), 201


# ============================================================
# BUSCAR USUÁRIO AUTENTICADO
# ============================================================

@usuarios_bp.get("/me")
@jwt_required()
def obter_meu_perfil():

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:

        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    return jsonify({

        "usuario": (
            serializar_usuario(
                usuario
            )
        )

    }), 200


# ============================================================
# ATUALIZAR PERFIL
# ============================================================

@usuarios_bp.patch("/perfil")
@jwt_required()
def atualizar_perfil():

    usuario = (
        obter_usuario_atual()
    )

    if not usuario:

        return jsonify({
            "erro": (
                "Usuário não encontrado."
            )
        }), 404

    # ========================================================
    # DADOS DO FORMULÁRIO
    # ========================================================

    nome = (
        request.form.get(
            "nome"
        )
        if request.form
        else None
    )

    sobrenome = (
        request.form.get(
            "sobrenome"
        )
        if request.form
        else None
    )

    email = (
        request.form.get(
            "email"
        )
        if request.form
        else None
    )

    senha = (
        request.form.get(
            "senha"
        )
        if request.form
        else None
    )

    remover_imagem = (
        request.form.get(
            "remover_imagem",
            "false"
        )
        .strip()
        .lower()
        == "true"
    )

    arquivo = (
        request.files.get(
            "imagem_perfil"
        )
    )

    # ========================================================
    # VALIDAR CAMPOS
    # ========================================================

    if nome is None:
        nome = usuario.nome

    else:
        nome = nome.strip()

    if sobrenome is None:
        sobrenome = usuario.sobrenome

    else:
        sobrenome = sobrenome.strip()

    if email is None:
        email = usuario.email

    else:
        email = (
            email
            .strip()
            .lower()
        )

    if not nome:

        return jsonify({
            "erro": (
                "Nome é obrigatório."
            )
        }), 400

    if not sobrenome:

        return jsonify({
            "erro": (
                "Sobrenome é obrigatório."
            )
        }), 400

    if not email:

        return jsonify({
            "erro": (
                "E-mail é obrigatório."
            )
        }), 400

    # ========================================================
    # VALIDAR E-MAIL
    # ========================================================

    outro_usuario = (
        Usuario.query.filter(
            Usuario.email == email,
            Usuario.id != usuario.id
        ).first()
    )

    if outro_usuario:

        return jsonify({
            "erro": (
                "Este e-mail já está "
                "cadastrado."
            )
        }), 409

    # ========================================================
    # VALIDAR SENHA
    # ========================================================

    if senha is not None:

        senha = senha.strip()

        if senha:

            if len(senha) < 8:

                return jsonify({
                    "erro": (
                        "A nova senha deve "
                        "ter pelo menos "
                        "8 caracteres."
                    )
                }), 400

        else:

            senha = None

    # ========================================================
    # VALIDAR IMAGEM
    # ========================================================

    if arquivo:

        if not imagem_valida(
            arquivo
        ):

            return jsonify({
                "erro": (
                    "Imagem inválida. "
                    "Envie JPG, PNG ou "
                    "WebP com no máximo "
                    "4 MB."
                )
            }), 400

    # ========================================================
    # ATUALIZAR DADOS BÁSICOS
    # ========================================================

    usuario.nome = nome

    usuario.sobrenome = sobrenome

    usuario.email = email

    if senha:

        usuario.senha_hash = (
            generate_password_hash(
                senha
            )
        )

    # ========================================================
    # FOTO DE PERFIL
    # ========================================================

    nova_url_imagem = (
        usuario.imagem_perfil
    )

    # --------------------------------------------------------
    # NOVA IMAGEM
    # --------------------------------------------------------

    if arquivo:

        public_id = (
            public_id_imagem_perfil(
                usuario.id
            )
        )

        try:

            resultado = (
                cloudinary.uploader.upload(
                    arquivo,
                    folder=(
                        PASTA_CLOUDINARY_PERFIL
                    ),
                    public_id=(
                        f"usuario_{usuario.id}"
                    ),
                    overwrite=True,
                    invalidate=True,
                    resource_type="image"
                )
            )

            nova_url_imagem = (
                resultado.get(
                    "secure_url"
                )
            )

            if not nova_url_imagem:

                raise RuntimeError(
                    "O Cloudinary não "
                    "retornou a URL segura "
                    "da imagem."
                )

            usuario.imagem_perfil = (
                nova_url_imagem
            )

        except Exception as error:

            db.session.rollback()

            print(
                "Erro ao enviar imagem "
                f"para o Cloudinary: {error}"
            )

            return jsonify({
                "erro": (
                    "Não foi possível "
                    "enviar a imagem de "
                    "perfil."
                )
            }), 500

    # --------------------------------------------------------
    # REMOVER IMAGEM
    # --------------------------------------------------------

    elif remover_imagem:

        excluir_imagem_perfil_cloudinary(
            usuario.id
        )

        usuario.imagem_perfil = None

        nova_url_imagem = None

    # ========================================================
    # SALVAR BANCO
    # ========================================================

    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Erro ao atualizar perfil:",
            error
        )

        return jsonify({
            "erro": (
                "Não foi possível "
                "salvar as alterações "
                "do perfil."
            )
        }), 500

    # ========================================================
    # RESPOSTA
    # ========================================================

    return jsonify({

        "mensagem": (
            "Perfil atualizado "
            "com sucesso."
        ),

        "usuario": (
            serializar_usuario(
                usuario
            )
        )

    }), 200