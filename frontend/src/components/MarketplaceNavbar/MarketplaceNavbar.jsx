import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Logo from "../Logo/Logo";

import {
  IconSearch,
  IconWallet,
  IconBell,
  IconMenu,
  IconUser,
  IconClipboard,
  IconLogout,
  IconArrowLeft,
  IconTicket,
} from "../Icons/Icons";

import NotificationsDropdown from "../NotificationsDropdown/NotificationsDropdown";

import { useAuth } from "../../auth/AuthContext";

import api from "../../services/api";

import "./MarketplaceNavbar.css";


function MarketplaceNavbar({
  pessoa: pessoaExterna,
  busca,
  setBusca,
  filtro,
  setFiltro,
  contexto = "anuncios",
  ordenacao: ordenacaoExterna,
  setOrdenacao: setOrdenacaoExterna,
  pontosMax: pontosMaxExterno,
  setPontosMax: setPontosMaxExterno,
  tituloPagina,
  aoVoltarPagina,
  tipo = "usuario",
}) {
  const navigate = useNavigate();

  const {
    pessoa: pessoaAutenticada,
    logout,
  } = useAuth();


  /* ============================================================
     MODO
  ============================================================ */

  const ehParceiro =
    tipo === "parceiro";


  /* ============================================================
     PESSOA LOGADA
  ============================================================ */

  const pessoa =
    pessoaExterna ||
    pessoaAutenticada ||
    null;


  /* ============================================================
     IMAGEM DE PERFIL
  ============================================================ */

  const [
    imagemPerfil,
    setImagemPerfil,
  ] = useState(
    pessoa?.imagem_perfil || null
  );


  /* ============================================================
     ESTADOS DA NAVBAR
  ============================================================ */

  const [
    filtroAberto,
    setFiltroAberto,
  ] = useState(false);

  const [
    menuAberto,
    setMenuAberto,
  ] = useState(false);

  const [
    notificacoesAbertas,
    setNotificacoesAbertas,
  ] = useState(false);


  /* ============================================================
     MODO DO TÍTULO
  ============================================================ */

  const modoTitulo =
    Boolean(tituloPagina);


  /* ============================================================
     FILTROS EXTRAS
  ============================================================ */

  const [
    ordenacaoInterna,
    setOrdenacaoInterna,
  ] = useState("recentes");

  const [
    pontosMaxInterno,
    setPontosMaxInterno,
  ] = useState(120);


  const ordenacao =
    ordenacaoExterna ??
    ordenacaoInterna;


  const pontosMax =
    pontosMaxExterno ??
    pontosMaxInterno;


  function alterarOrdenacao(
    valor
  ) {
    if (setOrdenacaoExterna) {
      setOrdenacaoExterna(valor);
    } else {
      setOrdenacaoInterna(valor);
    }
  }


  function alterarPontosMax(
    valor
  ) {
    const numero =
      Number(valor);


    if (setPontosMaxExterna) {
      setPontosMaxExterna(numero);
    } else {
      setPontosMaxInterno(numero);
    }
  }


  /* ============================================================
     REFS
  ============================================================ */

  const filtroRef =
    useRef(null);

  const menuRef =
    useRef(null);


  /* ============================================================
     CARREGAR IMAGEM DE PERFIL
  ============================================================ */

  useEffect(() => {
    let ativo = true;


    async function carregarImagemPerfil() {

      /*
       * Se uma pessoa externa foi informada,
       * usamos os dados fornecidos pelo componente.
       */
      if (pessoaExterna) {
        setImagemPerfil(
          pessoaExterna?.imagem_perfil ||
          null
        );

        return;
      }


      /*
       * Para parceiros, neste momento usamos
       * diretamente os dados da autenticação.
       *
       * Não fazemos chamada para /usuarios/me,
       * pois essa rota pertence ao fluxo do usuário.
       */
      if (ehParceiro) {
        setImagemPerfil(
          pessoaAutenticada?.imagem_perfil ||
          null
        );

        return;
      }


      if (!pessoaAutenticada) {
        setImagemPerfil(null);

        return;
      }


      /*
       * Aproveita imediatamente uma imagem
       * que já esteja disponível.
       */
      if (pessoaAutenticada?.imagem_perfil) {
        setImagemPerfil(
          pessoaAutenticada.imagem_perfil
        );
      }


      /*
       * Busca a versão atual do perfil do usuário.
       */
      try {
        const resposta =
          await api.get(
            "/usuarios/me"
          );


        if (
          ativo &&
          resposta?.data?.usuario
        ) {
          setImagemPerfil(
            resposta.data.usuario.imagem_perfil ||
            null
          );
        }
      } catch {
        if (ativo) {
          setImagemPerfil(
            pessoaAutenticada?.imagem_perfil ||
            null
          );
        }
      }
    }


    carregarImagemPerfil();


    return () => {
      ativo = false;
    };

  }, [
    pessoaExterna,
    pessoaAutenticada,
    ehParceiro,
  ]);


  /* ============================================================
     ATUALIZAÇÃO DO PERFIL
  ============================================================ */

  useEffect(() => {

    function atualizarImagemPerfil() {

      /*
       * O parceiro não utiliza a rota de perfil
       * do usuário.
       */
      if (ehParceiro) {
        setImagemPerfil(
          pessoa?.imagem_perfil ||
          null
        );

        return;
      }


      async function buscarImagem() {

        try {
          const resposta =
            await api.get(
              "/usuarios/me"
            );


          setImagemPerfil(
            resposta?.data?.usuario?.imagem_perfil ||
            null
          );

        } catch {
          setImagemPerfil(null);
        }
      }


      buscarImagem();
    }


    function handlePerfilAtualizado(
      event
    ) {
      const novaImagem =
        event?.detail?.imagem_perfil;


      if (
        novaImagem !== undefined
      ) {
        setImagemPerfil(
          novaImagem || null
        );

        return;
      }


      atualizarImagemPerfil();
    }


    window.addEventListener(
      "perfilAtualizado",
      handlePerfilAtualizado
    );


    return () => {
      window.removeEventListener(
        "perfilAtualizado",
        handlePerfilAtualizado
      );
    };

  }, [
    pessoa,
    ehParceiro,
  ]);


  /* ============================================================
     NOME DA PESSOA
  ============================================================ */

  const nomePessoa =
    pessoa?.nome ||
    pessoa?.nome_completo ||
    pessoa?.nome_estabelecimento ||
    "Usuário";


  const primeiroNome =
    nomePessoa
      .trim()
      .split(" ")[0] ||
    "Usuário";


  /* ============================================================
     INICIAIS
  ============================================================ */

  function obterIniciais(
    nome
  ) {
    if (!nome) {
      return "?";
    }


    const partes =
      nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      partes.length === 1
    ) {
      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  }


  const iniciais =
    obterIniciais(
      nomePessoa
    );


  /* ============================================================
     FILTROS
  ============================================================ */

  const filtrosAnuncios = [
    {
      valor: "todos",
      label: "Todos",
    },
    {
      valor: "doacao",
      label: "Doação",
    },
    {
      valor: "troca",
      label: "Troca",
    },
    {
      valor: "venda",
      label: "Venda",
    },
  ];


  const filtrosResgates = [
    {
      valor: "todos",
      label: "Todos",
    },
    {
      valor: "alimentacao",
      label: "Alimentação",
    },
    {
      valor: "cafeteria",
      label: "Cafeteria",
    },
    {
      valor: "papelaria",
      label: "Papelaria",
    },
    {
      valor: "lazer",
      label: "Lazer",
    },
  ];


  const filtros =
    contexto === "resgates"
      ? filtrosResgates
      : filtrosAnuncios;


  const placeholder =
    contexto === "resgates"
      ? "Busque cupons, parceiros e benefícios..."
      : "Pesquise livros, uniformes, materiais...";


  const filtroSelecionado =
    filtros.find(
      (item) =>
        item.valor === filtro
    ) || filtros[0];


  function selecionarFiltro(
    valor
  ) {
    if (setFiltro) {
      setFiltro(valor);
    }

    setFiltroAberto(false);
  }


  /* ============================================================
     BUSCA
  ============================================================ */

  function handleSubmitBusca(
    event
  ) {
    event.preventDefault();
  }


  /* ============================================================
     VOLTAR
  ============================================================ */

  function handleVoltarPagina() {

    if (aoVoltarPagina) {
      aoVoltarPagina();

      return;
    }

    navigate(-1);
  }


  /* ============================================================
     LOGOUT
  ============================================================ */

  function handleLogout() {

    setMenuAberto(false);

    setNotificacoesAbertas(
      false
    );

    setFiltroAberto(false);

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }


  /* ============================================================
     CLIQUE FORA
  ============================================================ */

  useEffect(() => {

    function handleClickOutside(
      event
    ) {

      if (
        filtroRef.current &&
        !filtroRef.current.contains(
          event.target
        )
      ) {
        setFiltroAberto(false);
      }


      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuAberto(false);
      }
    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  /* ============================================================
     ESC
  ============================================================ */

  useEffect(() => {

    function handleKeyDown(
      event
    ) {

      if (
        event.key === "Escape"
      ) {
        setFiltroAberto(false);

        setMenuAberto(false);

        setNotificacoesAbertas(
          false
        );
      }
    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, []);


  /* ============================================================
     NAVEGAÇÃO — PERFIL
  ============================================================ */

  function irParaPerfil() {

    setMenuAberto(false);

    setNotificacoesAbertas(
      false
    );

    if (ehParceiro) {
      navigate(
        "/parceiro/perfil"
      );

      return;
    }

    navigate("/perfil");
  }


  /* ============================================================
     NAVEGAÇÃO — HISTÓRICO
  ============================================================ */

  function irParaHistorico() {

    setMenuAberto(false);

    setNotificacoesAbertas(
      false
    );

    if (ehParceiro) {
      navigate(
        "/parceiro/cupons"
      );

      return;
    }

    navigate("/historico");
  }


  /* ============================================================
     DASHBOARD DO PARCEIRO
  ============================================================ */

  function irParaDashboardParceiro() {

    setMenuAberto(false);

    setNotificacoesAbertas(
      false
    );

    navigate(
      "/parceiro/dashboard"
    );
  }


  /* ============================================================
     CUPONS DO PARCEIRO
  ============================================================ */

  function irParaCuponsParceiro() {

    setMenuAberto(false);

    setNotificacoesAbertas(
      false
    );

    navigate(
      "/parceiro/cupons"
    );
  }


  /* ============================================================
     NOTIFICAÇÕES
  ============================================================ */

  function alternarNotificacoes(
    estadoForcado
  ) {

    const novoEstado =
      typeof estadoForcado ===
      "boolean"
        ? estadoForcado
        : !notificacoesAbertas;


    setNotificacoesAbertas(
      novoEstado
    );

    setMenuAberto(false);

    setFiltroAberto(false);
  }


  /* ============================================================
     MENU
  ============================================================ */

  function alternarMenu() {

    setMenuAberto(
      (estado) => !estado
    );

    setNotificacoesAbertas(
      false
    );

    setFiltroAberto(false);
  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <header
      className={
        ehParceiro
          ? "marketplace-navbar marketplace-navbar--partner"
          : "marketplace-navbar"
      }
    >

      <div className="marketplace-navbar-inner">

        {/* ======================================================
            LOGO
        ====================================================== */}

        <button
          type="button"
          className="marketplace-navbar-logo"
          onClick={() =>
            navigate(
              ehParceiro
                ? "/parceiro/dashboard"
                : "/inicio"
            )
          }
          aria-label={
            ehParceiro
              ? "Ir para o dashboard do parceiro"
              : "Ir para o início"
          }
        >

          <Logo
            variant="navbar"
          />

        </button>


        {/* ======================================================
            BUSCA OU TÍTULO
        ====================================================== */}

        {modoTitulo ? (

          <div className="marketplace-page-title-block">

            <button
              type="button"
              className="marketplace-page-back"
              onClick={
                handleVoltarPagina
              }
              aria-label="Voltar"
            >

              <IconArrowLeft
                size={18}
              />

            </button>


            <div
              className="marketplace-page-title-divider"
              aria-hidden="true"
            />


            <h1 className="marketplace-page-title">
              {tituloPagina}
            </h1>

          </div>

        ) : (

          <form
            className="marketplace-search"
            onSubmit={
              handleSubmitBusca
            }
          >

            <div
              className="marketplace-search-filter"
              ref={filtroRef}
            >

              <button
                type="button"
                className="marketplace-search-filter-button"
                onClick={() => {

                  setFiltroAberto(
                    (estado) =>
                      !estado
                  );

                  setMenuAberto(false);

                  setNotificacoesAbertas(
                    false
                  );
                }}
                aria-haspopup="dialog"
                aria-expanded={
                  filtroAberto
                }
                aria-label={`Filtro atual: ${filtroSelecionado.label}`}
              >

                <span>
                  {
                    filtroSelecionado.label
                  }
                </span>


                <span
                  className={
                    filtroAberto
                      ? "marketplace-search-chevron marketplace-search-chevron--open"
                      : "marketplace-search-chevron"
                  }
                  aria-hidden="true"
                >
                  ▾
                </span>

              </button>


              {filtroAberto && (

                <div
                  className={
                    contexto === "resgates"
                      ? "marketplace-filter-dropdown marketplace-filter-dropdown--wide"
                      : "marketplace-filter-dropdown"
                  }
                  role="dialog"
                  aria-label="Filtros"
                >

                  <div className="marketplace-filter-section marketplace-filter-niches">

                    <span className="marketplace-filter-title">
                      {
                        contexto ===
                        "resgates"
                          ? "Nicho"
                          : "Tipo de anúncio"
                      }
                    </span>


                    <div className="marketplace-filter-options">

                      {filtros.map(
                        (item) => (

                          <button
                            key={
                              item.valor
                            }
                            type="button"
                            className={
                              filtro ===
                              item.valor
                                ? "marketplace-filter-option marketplace-filter-option--active"
                                : "marketplace-filter-option"
                            }
                            onClick={() =>
                              selecionarFiltro(
                                item.valor
                              )
                            }
                            aria-pressed={
                              filtro ===
                              item.valor
                            }
                          >

                            <span>
                              {
                                item.label
                              }
                            </span>


                            {filtro ===
                              item.valor && (

                              <span
                                aria-hidden="true"
                                className="marketplace-filter-check"
                              >
                                ✓
                              </span>

                            )}

                          </button>

                        )
                      )}

                    </div>

                  </div>


                  {contexto ===
                    "resgates" && (
                    <>

                      <div
                        className="marketplace-filter-panel-divider"
                        aria-hidden="true"
                      />


                      <div className="marketplace-filter-section marketplace-filter-sort">

                        <span className="marketplace-filter-title">
                          Ordenar
                        </span>


                        <div className="marketplace-sort-control">

                          <select
                            value={
                              ordenacao
                            }
                            onChange={(
                              event
                            ) =>
                              alterarOrdenacao(
                                event.target.value
                              )
                            }
                            aria-label="Ordenar benefícios"
                          >

                            <option value="recentes">
                              Mais recentes
                            </option>

                            <option value="menor_pontos">
                              Menor pontuação
                            </option>

                            <option value="maior_pontos">
                              Maior pontuação
                            </option>

                          </select>

                        </div>

                      </div>


                      <div className="marketplace-filter-section marketplace-filter-points">

                        <div className="marketplace-filter-points-header">

                          <span className="marketplace-filter-title">
                            Quanto você quer gastar?
                          </span>


                          <strong>
                            {pontosMax} pts
                          </strong>

                        </div>


                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="10"
                          value={
                            pontosMax
                          }
                          onChange={(
                            event
                          ) =>
                            alterarPontosMax(
                              event.target.value
                            )
                          }
                          className="marketplace-points-range"
                          aria-label="Quantidade máxima de pontos"
                        />


                        <div className="marketplace-points-range-labels">

                          <span>
                            0 pts
                          </span>

                          <span>
                            500 pts
                          </span>

                        </div>


                        <span className="marketplace-filter-points-limit">
                          até{" "}
                          {pontosMax}{" "}
                          pts
                        </span>

                      </div>

                    </>
                  )}

                </div>

              )}

            </div>


            <div
              className="marketplace-search-divider"
              aria-hidden="true"
            />


            <label
              htmlFor="marketplace-search-input"
              className="sr-only"
            >
              Pesquisar
            </label>


            <input
              id="marketplace-search-input"
              type="search"
              value={busca || ""}
              onChange={(event) => {

                if (setBusca) {
                  setBusca(
                    event.target.value
                  );
                }

              }}
              placeholder={
                placeholder
              }
              autoComplete="off"
            />


            {busca && (

              <button
                type="button"
                className="marketplace-search-clear"
                onClick={() =>
                  setBusca("")
                }
                aria-label="Limpar pesquisa"
              >
                ×
              </button>

            )}


            <button
              type="submit"
              className="marketplace-search-button"
              aria-label="Pesquisar"
            >

              <IconSearch
                size={17}
              />

            </button>

          </form>

        )}


        {/* ======================================================
            BLOCO DA PESSOA
        ====================================================== */}

        <div className="marketplace-user-area">

          <span
            className={
              imagemPerfil
                ? "marketplace-user-avatar marketplace-user-avatar--image"
                : "marketplace-user-avatar"
            }
            aria-hidden="true"
          >

            {imagemPerfil ? (

              <img
                src={imagemPerfil}
                alt=""
                className="marketplace-user-avatar-image"
              />

            ) : (

              iniciais

            )}

          </span>


          <span className="marketplace-user-greeting">

            <strong>
              {ehParceiro
                ? `Olá, ${primeiroNome}! Vamos Conectar?`
                : `Olá, ${primeiroNome}! Vamos conectar?`
              }
            </strong>


            <span className="marketplace-user-community">

              {ehParceiro
                ? "Gerencie seus cupons e benefícios."
                : "Juntos, fazemos a comunidade circular."
              }

            </span>

          </span>

        </div>


        {/* ======================================================
            AÇÕES
        ====================================================== */}

        <div className="marketplace-user-actions">

          {/* ====================================================
              PONTOS — SOMENTE USUÁRIO
          ==================================================== */}

          {!ehParceiro && (

            <button
              type="button"
              className="marketplace-action marketplace-points"
              aria-label="Saldo de pontos"
              title="Saldo de pontos"
              onClick={() =>
                navigate(
                  "/historico"
                )
              }
            >

              <span className="marketplace-action-icon">

                <IconWallet
                  size={18}
                />

              </span>


              <span className="marketplace-points-value">
                —
              </span>

            </button>

          )}


          {/* ====================================================
              PARCEIRO — CUPONS
          ==================================================== */}

          {ehParceiro && (

            <button
              type="button"
              className="marketplace-action marketplace-points"
              aria-label="Meus cupons"
              title="Meus cupons"
              onClick={
                irParaCuponsParceiro
              }
            >

              <span className="marketplace-action-icon">

                <IconTicket
                  size={18}
                />

              </span>

            </button>

          )}


          {/* ====================================================
              NOTIFICAÇÕES
          ==================================================== */}

          <div className="marketplace-action-wrapper">

            <button
              type="button"
              className={
                notificacoesAbertas
                  ? "marketplace-action marketplace-notification-button marketplace-action--active"
                  : "marketplace-action marketplace-notification-button"
              }
              onClick={() =>
                alternarNotificacoes()
              }
              aria-label="Notificações"
              aria-haspopup="dialog"
              aria-expanded={
                notificacoesAbertas
              }
              title="Notificações"
            >

              <span className="marketplace-action-icon">

                <IconBell
                  size={18}
                />

              </span>

            </button>


            <NotificationsDropdown
              aberta={
                notificacoesAbertas
              }
              aoAlternar={
                alternarNotificacoes
              }
            />

          </div>


          {/* ====================================================
              MENU
          ==================================================== */}

          <div
            className="marketplace-action-wrapper"
            ref={menuRef}
          >

            <button
              type="button"
              className={
                menuAberto
                  ? "marketplace-action marketplace-menu-button marketplace-action--active"
                  : "marketplace-action marketplace-menu-button"
              }
              onClick={
                alternarMenu
              }
              aria-label="Abrir menu"
              aria-haspopup="menu"
              aria-expanded={
                menuAberto
              }
              title="Menu"
            >

              <span className="marketplace-menu-icon">

                <IconMenu
                  size={19}
                />

              </span>

            </button>


            {menuAberto && (

              <div
                className="marketplace-user-menu"
                role="menu"
                aria-label={
                  ehParceiro
                    ? "Menu do parceiro"
                    : "Menu do usuário"
                }
              >

                <div className="marketplace-user-menu-profile">

                  <div
                    className="marketplace-user-menu-avatar"
                    aria-hidden="true"
                  >
                    {iniciais}
                  </div>


                  <div>

                    <strong>
                      {nomePessoa}
                    </strong>


                    <span>
                      {pessoa?.email ||
                        "Conta Conecta"}
                    </span>

                  </div>

                </div>


                <div
                  className="marketplace-menu-divider"
                  aria-hidden="true"
                />


                {/* =================================================
                    MENU DO PARCEIRO
                ================================================== */}

                {ehParceiro ? (

                  <>

                    <button
                      type="button"
                      className="marketplace-menu-option"
                      onClick={
                        irParaDashboardParceiro
                      }
                      role="menuitem"
                    >

                      <span className="marketplace-menu-option-icon">

                        <IconClipboard
                          size={17}
                        />

                      </span>


                      <span>
                        Dashboard
                      </span>

                    </button>


                    <button
                      type="button"
                      className="marketplace-menu-option"
                      onClick={
                        irParaCuponsParceiro
                      }
                      role="menuitem"
                    >

                      <span className="marketplace-menu-option-icon">

                        <IconTicket
                          size={17}
                        />

                      </span>


                      <span>
                        Meus cupons
                      </span>

                    </button>


                    <button
                      type="button"
                      className="marketplace-menu-option"
                      onClick={
                        irParaPerfil
                      }
                      role="menuitem"
                    >

                      <span className="marketplace-menu-option-icon">

                        <IconUser
                          size={17}
                        />

                      </span>


                      <span>
                        Dados do parceiro
                      </span>

                    </button>

                  </>

                ) : (

                  /* ===============================================
                     MENU DO USUÁRIO
                  ================================================ */

                  <>

                    <button
                      type="button"
                      className="marketplace-menu-option"
                      onClick={
                        irParaPerfil
                      }
                      role="menuitem"
                    >

                      <span className="marketplace-menu-option-icon">

                        <IconUser
                          size={17}
                        />

                      </span>


                      <span>
                        Meus dados
                      </span>

                    </button>


                    <button
                      type="button"
                      className="marketplace-menu-option"
                      onClick={
                        irParaHistorico
                      }
                      role="menuitem"
                    >

                      <span className="marketplace-menu-option-icon">

                        <IconClipboard
                          size={17}
                        />

                      </span>


                      <span>
                        Histórico
                      </span>

                    </button>

                  </>

                )}


                <div
                  className="marketplace-menu-divider"
                  aria-hidden="true"
                />


                <button
                  type="button"
                  className="marketplace-menu-option marketplace-menu-option--logout"
                  onClick={
                    handleLogout
                  }
                  role="menuitem"
                >

                  <span className="marketplace-menu-option-icon">

                    <IconLogout
                      size={17}
                    />

                  </span>


                  <span>
                    Sair
                  </span>

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}


export default MarketplaceNavbar;