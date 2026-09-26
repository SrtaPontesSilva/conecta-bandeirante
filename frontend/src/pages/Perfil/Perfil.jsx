import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  IconUser,
  IconCheck,
  IconCamera,
  IconAlertTriangle,
} from "../../components/Icons/Icons";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import api from "../../services/api";

import "./Perfil.css";


function Perfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [usuario, setUsuario] = useState(null);

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [previewImagem, setPreviewImagem] = useState("");

  const [
    removerImagemSelecionada,
    setRemoverImagemSelecionada,
  ] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  /*
   * ==========================================================
   * SNAPSHOT INICIAL
   * ==========================================================
   *
   * Guarda somente os dados necessários para saber se existem
   * alterações ainda não salvas.
   *
   * A imagem é representada pela URL retornada pelo backend,
   * nunca pelo conteúdo Base64 do arquivo.
   */

  const snapshotInicialRef = useRef(null);

  /*
   * ==========================================================
   * MODAL DE CONFIRMAÇÃO DE SAÍDA
   * ==========================================================
   */

  const [
    confirmarSaidaAberto,
    setConfirmarSaidaAberto,
  ] = useState(false);

  /*
   * ==========================================================
   * CARREGAR USUÁRIO
   * ==========================================================
   *
   * O perfil é buscado diretamente no backend.
   *
   * Isso garante que a imagem de perfil venha da informação
   * persistida no banco/Cloudinary.
   */

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await api.get("/usuarios/me");

        if (!ativo) {
          return;
        }

        const dadosUsuario =
          resposta.data?.usuario;

        if (!dadosUsuario) {
          throw new Error(
            "Dados do usuário não encontrados."
          );
        }

        const nomeInicial =
          dadosUsuario.nome || "";

        const sobrenomeInicial =
          dadosUsuario.sobrenome || "";

        const emailInicial =
          dadosUsuario.email || "";

        const cpfInicial =
          dadosUsuario.cpf || "";

        const imagemInicial =
          dadosUsuario.imagem_perfil || "";

        setUsuario(dadosUsuario);

        setNome(nomeInicial);
        setSobrenome(sobrenomeInicial);
        setEmail(emailInicial);
        setCpf(cpfInicial);

        setImagemPerfil(null);
        setPreviewImagem(imagemInicial);

        setRemoverImagemSelecionada(false);

        setSenha("");
        setConfirmarSenha("");

        snapshotInicialRef.current = {
          nome: nomeInicial,
          sobrenome: sobrenomeInicial,
          email: emailInicial,
          imagem: imagemInicial,
        };

        /*
         * Mantém os dados básicos sincronizados com o objeto
         * "usuario" utilizado por outras partes da aplicação.
         *
         * A imagem armazenada aqui é somente a URL retornada
         * pelo backend. Nunca armazenamos Base64.
         */

        const usuarioLocalAtualizado = {
          ...dadosUsuario,
          imagem_perfil:
            imagemInicial || null,
        };

        localStorage.setItem(
          "usuario",
          JSON.stringify(
            usuarioLocalAtualizado
          )
        );
      } catch (error) {
        if (!ativo) {
          return;
        }

        console.error(
          "Erro ao carregar perfil:",
          error
        );

        if (
          error?.response?.status === 401
        ) {
          localStorage.removeItem(
            "usuario"
          );

          navigate("/login");

          return;
        }

        if (
          error?.response?.status === 404
        ) {
          setErro(
            "Usuário não encontrado."
          );

          return;
        }

        setErro(
          "Não foi possível carregar seu perfil. Tente novamente."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  /*
   * ==========================================================
   * DETECÇÃO DE ALTERAÇÕES NÃO SALVAS
   * ==========================================================
   */

  function possuiAlteracoesNaoSalvas() {
    const snapshot =
      snapshotInicialRef.current;

    if (!snapshot) {
      return false;
    }

    const camposAlterados =
      nome !== snapshot.nome ||
      sobrenome !== snapshot.sobrenome ||
      email !== snapshot.email ||
      previewImagem !== snapshot.imagem;

    const senhaPreenchida =
      senha.length > 0 ||
      confirmarSenha.length > 0;

    const imagemNovaSelecionada =
      Boolean(imagemPerfil);

    const imagemMarcadaParaRemocao =
      removerImagemSelecionada &&
      Boolean(snapshot.imagem);

    return (
      camposAlterados ||
      senhaPreenchida ||
      imagemNovaSelecionada ||
      imagemMarcadaParaRemocao
    );
  }

  /*
   * ==========================================================
   * AVISO AO FECHAR/RECARREGAR A ABA
   * ==========================================================
   */

  useEffect(() => {
    function handleBeforeUnload(event) {
      if (
        possuiAlteracoesNaoSalvas()
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  /*
   * ==========================================================
   * SAIR DA PÁGINA
   * ==========================================================
   */

  const solicitarSaida =
    useCallback(() => {
      if (
        possuiAlteracoesNaoSalvas()
      ) {
        setConfirmarSaidaAberto(
          true
        );

        return;
      }

      navigate(-1);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      nome,
      sobrenome,
      email,
      previewImagem,
      imagemPerfil,
      removerImagemSelecionada,
      senha,
      confirmarSenha,
    ]);

  function confirmarDescarteESair() {
    setConfirmarSaidaAberto(false);
    navigate(-1);
  }

  function cancelarSaida() {
    setConfirmarSaidaAberto(false);
  }

  /*
   * ==========================================================
   * FOTO DE PERFIL
   * ==========================================================
   */

  function abrirSeletorImagem() {
    if (salvando) {
      return;
    }

    fileInputRef.current?.click();
  }

  function handleImagemChange(event) {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    setErro("");
    setMensagem("");

    /*
     * Verifica o MIME type aceito pelo backend.
     */

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !tiposPermitidos.includes(
        arquivo.type
      )
    ) {
      setErro(
        "Selecione uma imagem JPG, PNG ou WebP."
      );

      event.target.value = "";

      return;
    }

    /*
     * O backend também limita a imagem a 4 MB.
     */

    if (
      arquivo.size >
      4 * 1024 * 1024
    ) {
      setErro(
        "A imagem deve ter no máximo 4 MB."
      );

      event.target.value = "";

      return;
    }

    setImagemPerfil(arquivo);

    setRemoverImagemSelecionada(
      false
    );

    /*
     * Preview local apenas para a interface.
     *
     * Esta URL NÃO é salva no localStorage
     * nem enviada como Base64 para o backend.
     */

    const leitor = new FileReader();

    leitor.onload = () => {
      setPreviewImagem(
        typeof leitor.result ===
          "string"
          ? leitor.result
          : ""
      );
    };

    leitor.onerror = () => {
      setErro(
        "Não foi possível visualizar a imagem selecionada."
      );

      setImagemPerfil(null);
    };

    leitor.readAsDataURL(arquivo);
  }

  /*
   * ==========================================================
   * REMOVER FOTO
   * ==========================================================
   */

  function removerImagem() {
    setImagemPerfil(null);

    setPreviewImagem("");

    setRemoverImagemSelecionada(
      true
    );

    setErro("");
    setMensagem("");

    /*
     * Limpa o input para permitir selecionar novamente
     * a mesma imagem depois.
     */

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * ==========================================================
   * SINCRONIZAR NAVBAR
   * ==========================================================
   *
   * A Navbar escuta o evento "perfilAtualizado".
   *
   * Assim que o backend confirma a alteração, a foto do
   * avatar principal da Navbar pode ser atualizada imediatamente,
   * sem precisar recarregar a página.
   */

  function notificarPerfilAtualizado(
    usuarioAtualizado
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "perfilAtualizado",
        {
          detail: {
            imagem_perfil:
              usuarioAtualizado
                ?.imagem_perfil ||
              null,
          },
        }
      )
    );
  }

  /*
   * ==========================================================
   * SALVAR ALTERAÇÕES
   * ==========================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!sobrenome.trim()) {
      setErro(
        "Informe seu sobrenome."
      );
      return;
    }

    if (!email.trim()) {
      setErro(
        "Informe seu e-mail."
      );
      return;
    }

    if (
      senha &&
      senha.length < 8
    ) {
      setErro(
        "A nova senha deve ter pelo menos 8 caracteres."
      );

      return;
    }

    if (
      senha !== confirmarSenha
    ) {
      setErro(
        "As senhas não coincidem."
      );

      return;
    }

    setSalvando(true);

    try {
      /*
       * ========================================================
       * FORMDATA
       * ========================================================
       *
       * O endpoint aceita multipart/form-data porque pode
       * receber uma imagem junto dos demais dados.
       */

      const formData =
        new FormData();

      formData.append(
        "nome",
        nome.trim()
      );

      formData.append(
        "sobrenome",
        sobrenome.trim()
      );

      formData.append(
        "email",
        email.trim()
      );

      /*
       * Só envia senha quando o usuário realmente deseja
       * alterá-la.
       */

      if (senha.trim()) {
        formData.append(
          "senha",
          senha
        );
      }

      /*
       * Envia a nova imagem somente quando uma imagem foi
       * selecionada.
       */

      if (imagemPerfil) {
        formData.append(
          "imagem_perfil",
          imagemPerfil
        );
      }

      /*
       * Só solicita remoção quando o usuário clicou em
       * "Remover foto" e não selecionou outra imagem depois.
       */

      if (
        removerImagemSelecionada &&
        !imagemPerfil
      ) {
        formData.append(
          "remover_imagem",
          "true"
        );
      }

      /*
       * Axios envia o FormData como multipart/form-data.
       *
       * Não definimos manualmente o Content-Type para que o
       * boundary seja configurado corretamente.
       */

      const resposta =
        await api.patch(
          "/usuarios/perfil",
          formData
        );

      const usuarioAtualizado =
        resposta.data?.usuario;

      if (!usuarioAtualizado) {
        throw new Error(
          "A API não retornou os dados atualizados do usuário."
        );
      }

      /*
       * ========================================================
       * ATUALIZA ESTADO LOCAL
       * ========================================================
       */

      setUsuario(
        usuarioAtualizado
      );

      setNome(
        usuarioAtualizado.nome ||
          ""
      );

      setSobrenome(
        usuarioAtualizado.sobrenome ||
          ""
      );

      setEmail(
        usuarioAtualizado.email ||
          ""
      );

      setCpf(
        usuarioAtualizado.cpf ||
          ""
      );

      setImagemPerfil(null);

      const imagemAtualizada =
        usuarioAtualizado.imagem_perfil ||
        "";

      setPreviewImagem(
        imagemAtualizada
      );

      setRemoverImagemSelecionada(
        false
      );

      setSenha("");
      setConfirmarSenha("");

      /*
       * ========================================================
       * SINCRONIZA LOCALSTORAGE
       * ========================================================
       *
       * Armazena somente a URL retornada pelo backend.
       *
       * Nunca armazenamos o arquivo ou o Base64.
       */

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuarioAtualizado,
          imagem_perfil:
            imagemAtualizada ||
            null,
        })
      );

      /*
       * ========================================================
       * ATUALIZA NAVBAR IMEDIATAMENTE
       * ========================================================
       *
       * A MarketplaceNavbar recebe a URL oficial retornada
       * pelo backend.
       */

      notificarPerfilAtualizado(
        usuarioAtualizado
      );

      /*
       * ========================================================
       * NOVO SNAPSHOT
       * ========================================================
       *
       * O estado atual passa a ser considerado o estado salvo.
       */

      snapshotInicialRef.current = {
        nome:
          usuarioAtualizado.nome ||
          "",
        sobrenome:
          usuarioAtualizado.sobrenome ||
          "",
        email:
          usuarioAtualizado.email ||
          "",
        imagem:
          imagemAtualizada,
      };

      setMensagem(
        "Perfil atualizado com sucesso."
      );

      /*
       * Permite selecionar novamente a mesma imagem
       * posteriormente.
       */

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Erro ao salvar perfil:",
        error
      );

      const mensagemErro =
        error?.response?.data?.erro ||
        error?.response?.data?.message;

      if (
        error?.response?.status ===
        401
      ) {
        localStorage.removeItem(
          "usuario"
        );

        navigate("/login");

        return;
      }

      if (
        error?.response?.status ===
        409
      ) {
        setErro(
          mensagemErro ||
            "Este e-mail já está cadastrado."
        );

        return;
      }

      if (
        error?.response?.status ===
        400
      ) {
        setErro(
          mensagemErro ||
            "Verifique os dados informados."
        );

        return;
      }

      setErro(
        mensagemErro ||
          "Não foi possível salvar as alterações. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  /*
   * ==========================================================
   * FORMATAR CPF
   * ==========================================================
   */

  function formatarCpf(valor) {
    if (!valor) {
      return "";
    }

    const apenasNumeros =
      valor
        .replace(/\D/g, "")
        .slice(0, 11);

    if (!apenasNumeros) {
      return "";
    }

    return apenasNumeros
      .replace(
        /(\d{3})(\d)/,
        "$1.$2"
      )
      .replace(
        /(\d{3})(\d)/,
        "$1.$2"
      )
      .replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2"
      );
  }

  const cpfFormatado =
    formatarCpf(cpf);

  /*
   * ==========================================================
   * INICIAIS — FALLBACK DO AVATAR
   * ==========================================================
   */

  function obterIniciais() {
    const base =
      `${nome} ${sobrenome}`.trim();

    if (!base) {
      return "?";
    }

    const partes = base
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 1) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  }

  /*
   * ==========================================================
   * CARREGAMENTO
   * ==========================================================
   */

  if (
    carregando &&
    !usuario
  ) {
    return (
      <div className="perfil-page">
        <MarketplaceNavbar
          tituloPagina="Meu perfil"
          aoVoltarPagina={
            solicitarSaida
          }
        />

        <main className="perfil-content">
          <div
            className="perfil-message"
            role="status"
          >
            <span>
              Carregando seu perfil...
            </span>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  /*
   * Se houve erro e não foi possível carregar o usuário,
   * não renderiza o formulário vazio.
   */

  if (!usuario) {
    return (
      <div className="perfil-page">
        <MarketplaceNavbar
          tituloPagina="Meu perfil"
          aoVoltarPagina={
            solicitarSaida
          }
        />

        <main className="perfil-content">
          {erro && (
            <div
              className="perfil-message perfil-message-error"
              role="alert"
            >
              <span>{erro}</span>
            </div>
          )}

          <button
            type="button"
            className="perfil-save-button"
            onClick={() =>
              navigate(-1)
            }
          >
            Voltar
          </button>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="perfil-page">
      <MarketplaceNavbar
        tituloPagina="Meu perfil"
        aoVoltarPagina={
          solicitarSaida
        }
      />

      <main className="perfil-content">
        {/* ====================================================
            MENSAGENS
        ===================================================== */}

        {mensagem && (
          <div
            className="perfil-message perfil-message-success"
            role="status"
          >
            <IconCheck size={17} />

            <span>
              {mensagem}
            </span>
          </div>
        )}

        {erro && (
          <div
            className="perfil-message perfil-message-error"
            role="alert"
          >
            <IconAlertTriangle
              size={17}
            />

            <span>
              {erro}
            </span>
          </div>
        )}

        <form
          className="perfil-form"
          onSubmit={handleSubmit}
        >
          {/* ==================================================
              PERFIL: FOTO + DADOS PESSOAIS
          =================================================== */}

          <section className="perfil-card">
            <div className="perfil-section-heading">
              <span className="perfil-section-label">
                Informações pessoais
              </span>

              <h2>
                Seus dados
              </h2>

              <p>
                Mantenha seu perfil sempre
                atualizado.
              </p>
            </div>

            <div className="perfil-profile-layout">
              {/* ------------------------------------------
                  FOTO
              ------------------------------------------- */}

              <div className="perfil-avatar-block">
                <div className="perfil-avatar-wrapper">
                  {previewImagem ? (
                    <img
                      src={
                        previewImagem
                      }
                      alt={`Foto de perfil de ${
                        nome ||
                        "usuário"
                      }`}
                      className="perfil-avatar"
                    />
                  ) : (
                    <div
                      className="perfil-avatar perfil-avatar-placeholder"
                      aria-hidden="true"
                    >
                      {nome ? (
                        obterIniciais()
                      ) : (
                        <IconUser
                          size={34}
                        />
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="perfil-avatar-edit"
                    onClick={
                      abrirSeletorImagem
                    }
                    disabled={
                      salvando
                    }
                    aria-label="Alterar foto de perfil"
                    title="Alterar foto"
                  >
                    <IconCamera
                      size={16}
                    />
                  </button>
                </div>

                {previewImagem && (
                  <button
                    type="button"
                    className="perfil-remove-button"
                    onClick={
                      removerImagem
                    }
                    disabled={
                      salvando
                    }
                  >
                    Remover foto
                  </button>
                )}

                <span className="perfil-photo-hint">
                  JPG, PNG ou WebP · até
                  4 MB
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="perfil-file-input"
                  onChange={
                    handleImagemChange
                  }
                  aria-label="Selecionar foto de perfil"
                  disabled={
                    salvando
                  }
                />
              </div>

              {/* ------------------------------------------
                  CAMPOS
              ------------------------------------------- */}

              <div className="perfil-fields">
                <div className="perfil-field">
                  <label htmlFor="perfil-nome">
                    Nome
                  </label>

                  <input
                    id="perfil-nome"
                    type="text"
                    value={nome}
                    onChange={(
                      event
                    ) =>
                      setNome(
                        event.target
                          .value
                      )
                    }
                    autoComplete="given-name"
                    required
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="perfil-field">
                  <label htmlFor="perfil-sobrenome">
                    Sobrenome
                  </label>

                  <input
                    id="perfil-sobrenome"
                    type="text"
                    value={
                      sobrenome
                    }
                    onChange={(
                      event
                    ) =>
                      setSobrenome(
                        event.target
                          .value
                      )
                    }
                    autoComplete="family-name"
                    required
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="perfil-field perfil-field-full">
                  <label htmlFor="perfil-email">
                    E-mail
                  </label>

                  <input
                    id="perfil-email"
                    type="email"
                    value={email}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    autoComplete="email"
                    required
                    disabled={
                      salvando
                    }
                  />
                </div>

                <div className="perfil-field perfil-field-full">
                  <div className="perfil-field-label-row">
                    <label htmlFor="perfil-cpf">
                      CPF
                    </label>

                    <span className="perfil-badge-verificado">
                      <IconCheck
                        size={12}
                      />

                      Verificado
                    </span>
                  </div>

                  <input
                    id="perfil-cpf"
                    type="text"
                    className="perfil-input-cpf"
                    value={
                      cpfFormatado
                    }
                    readOnly
                    placeholder="CPF não informado"
                    aria-describedby="perfil-cpf-help"
                  />

                  <small id="perfil-cpf-help">
                    O CPF é utilizado
                    para identificação
                    da conta e não pode
                    ser alterado.
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              SENHA
          =================================================== */}

          <section className="perfil-card">
            <div className="perfil-section-heading">
              <span className="perfil-section-label">
                Segurança
              </span>

              <h2>
                Alterar senha
              </h2>

              <p>
                Preencha os campos abaixo
                somente se quiser alterar
                sua senha.
              </p>
            </div>

            <div className="perfil-fields">
              <div className="perfil-field">
                <label htmlFor="perfil-senha">
                  Nova senha
                </label>

                <input
                  id="perfil-senha"
                  type="password"
                  value={senha}
                  onChange={(
                    event
                  ) =>
                    setSenha(
                      event.target
                        .value
                    )
                  }
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Mínimo de 8 caracteres"
                  disabled={
                    salvando
                  }
                />
              </div>

              <div className="perfil-field">
                <label htmlFor="perfil-confirmar-senha">
                  Confirmar nova senha
                </label>

                <input
                  id="perfil-confirmar-senha"
                  type="password"
                  value={
                    confirmarSenha
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmarSenha(
                      event.target
                        .value
                    )
                  }
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Repita a nova senha"
                  disabled={
                    salvando
                  }
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              AÇÕES
          =================================================== */}

          <div className="perfil-actions">
            <button
              type="button"
              className="perfil-cancel-button"
              onClick={
                solicitarSaida
              }
              disabled={
                salvando
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="perfil-save-button"
              disabled={
                salvando
              }
            >
              {salvando
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </form>
      </main>

      <BottomNavigation />

      {/* ====================================================
          MODAL: ALTERAÇÕES NÃO SALVAS
      ===================================================== */}

      {confirmarSaidaAberto && (
        <div
          className="perfil-modal-overlay"
          role="presentation"
          onClick={
            cancelarSaida
          }
        >
          <div
            className="perfil-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="perfil-modal-titulo"
            aria-describedby="perfil-modal-descricao"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="perfil-modal-icon"
              aria-hidden="true"
            >
              <IconAlertTriangle
                size={22}
              />
            </div>

            <h2 id="perfil-modal-titulo">
              Sair sem salvar?
            </h2>

            <p id="perfil-modal-descricao">
              Você tem alterações que ainda
              não foram salvas. Se sair agora,
              essas alterações serão perdidas.
            </p>

            <div className="perfil-modal-actions">
              <button
                type="button"
                className="perfil-cancel-button"
                onClick={
                  cancelarSaida
                }
                autoFocus
              >
                Continuar editando
              </button>

              <button
                type="button"
                className="perfil-discard-button"
                onClick={
                  confirmarDescarteESair
                }
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Perfil;