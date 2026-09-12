import { useEffect, useRef, useState } from "react";
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
} from "../Icons/Icons";

import "./MarketplaceNavbar.css";

function MarketplaceNavbar({
  pessoa,
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
}) {
  const navigate = useNavigate();

  const [filtroAberto, setFiltroAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] =
    useState(false);

  /*
   * ============================================================
   * MODO DA NAVBAR
   * ------------------------------------------------------------
   * Quando `tituloPagina` é informado, a navbar exibe um botão
   * de voltar + o título da tela no lugar da barra de busca.
   * Usado em telas de formulário, como "Novo anúncio".
   * ============================================================
   */

  const modoTitulo = Boolean(tituloPagina);

  /*
   * ============================================================
   * FILTROS EXTRAS
   * ============================================================
   */

  const [ordenacaoInterna, setOrdenacaoInterna] =
    useState("recentes");

  const [pontosMaxInterno, setPontosMaxInterno] =
    useState(120);

  const ordenacao =
    ordenacaoExterna ?? ordenacaoInterna;

  const pontosMax =
    pontosMaxExterno ?? pontosMaxInterno;

  function alterarOrdenacao(valor) {
    if (setOrdenacaoExterna) {
      setOrdenacaoExterna(valor);
    } else {
      setOrdenacaoInterna(valor);
    }
  }

  function alterarPontosMax(valor) {
    const numero = Number(valor);

    if (setPontosMaxExterno) {
      setPontosMaxExterno(numero);
    } else {
      setPontosMaxInterno(numero);
    }
  }

  /*
   * ============================================================
   * REFS
   * ============================================================
   */

  const filtroRef = useRef(null);
  const menuRef = useRef(null);
  const notificacoesRef = useRef(null);

  /*
   * ============================================================
   * NOME DO USUÁRIO
   * ============================================================
   */

  const nomePessoa =
    pessoa?.nome ||
    pessoa?.nome_completo ||
    pessoa?.nome_estabelecimento ||
    "Usuário";

  const primeiroNome =
    nomePessoa.trim().split(" ")[0] || "Usuário";

  /*
   * ============================================================
   * INICIAIS
   * ============================================================
   */

  function obterIniciais(nome) {
    if (!nome) {
      return "?";
    }

    const partes = nome
      .trim()
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

  const iniciais = obterIniciais(nomePessoa);

  /*
   * ============================================================
   * FILTROS / NICHOS
   * ============================================================
   */

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
      (item) => item.valor === filtro
    ) || filtros[0];

  function selecionarFiltro(valor) {
    setFiltro(valor);
  }

  /*
   * ============================================================
   * BUSCA
   * ============================================================
   */

  function handleSubmitBusca(event) {
    event.preventDefault();
  }

  /*
   * ============================================================
   * VOLTAR (MODO TÍTULO)
   * ============================================================
   */

  function handleVoltarPagina() {
    if (aoVoltarPagina) {
      aoVoltarPagina();
    } else {
      navigate(-1);
    }
  }

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  function handleLogout() {
    setMenuAberto(false);

    localStorage.removeItem("usuario");
    localStorage.removeItem("parceiro");

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * ============================================================
   * CLIQUE FORA DOS DROPDOWNS
   * ============================================================
   */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filtroRef.current &&
        !filtroRef.current.contains(event.target)
      ) {
        setFiltroAberto(false);
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuAberto(false);
      }

      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(
          event.target
        )
      ) {
        setNotificacoesAbertas(false);
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

  /*
   * ============================================================
   * ESC
   * ============================================================
   */

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setFiltroAberto(false);
        setMenuAberto(false);
        setNotificacoesAbertas(false);
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

  /*
   * ============================================================
   * NAVEGAÇÃO
   * ============================================================
   */

  function irParaPerfil() {
    setMenuAberto(false);
    setNotificacoesAbertas(false);

    navigate("/perfil");
  }

  function irParaHistorico() {
    setMenuAberto(false);
    setNotificacoesAbertas(false);

    navigate("/historico");
  }

  function alternarNotificacoes() {
    setNotificacoesAbertas(
      (estado) => !estado
    );

    setMenuAberto(false);
  }

  function alternarMenu() {
    setMenuAberto(
      (estado) => !estado
    );

    setNotificacoesAbertas(false);
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <header className="marketplace-navbar">
      <div className="marketplace-navbar-inner">

        {/* ====================================================
            LOGO
        ===================================================== */}

        <button
          type="button"
          className="marketplace-navbar-logo"
          onClick={() => navigate("/inicio")}
          aria-label="Ir para o início"
        >
          <Logo variant="navbar" />
        </button>

        {/* ====================================================
            BUSCA (padrão) OU TÍTULO DA PÁGINA (formulários)
        ===================================================== */}

        {modoTitulo ? (
          <div className="marketplace-page-title-block">
            <button
              type="button"
              className="marketplace-page-back"
              onClick={handleVoltarPagina}
              aria-label="Voltar"
            >
              <IconArrowLeft size={18} />
            </button>

            <div className="marketplace-page-title-divider" />

            <h1 className="marketplace-page-title">
              {tituloPagina}
            </h1>
          </div>
        ) : (
          <form
            className="marketplace-search"
            onSubmit={handleSubmitBusca}
          >
            <div
              className="marketplace-search-filter"
              ref={filtroRef}
            >
              <button
                type="button"
                className="marketplace-search-filter-button"
                onClick={() =>
                  setFiltroAberto(
                    (estado) => !estado
                  )
                }
                aria-haspopup="dialog"
                aria-expanded={filtroAberto}
              >
                <span>
                  {filtroSelecionado.label}
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

                  {/* ==================================================
                      OPÇÕES DE NICHO / TIPO
                  =================================================== */}

                  <div className="marketplace-filter-section marketplace-filter-niches">
                    <span className="marketplace-filter-title">
                      {contexto === "resgates"
                        ? "Nicho"
                        : "Tipo de anúncio"}
                    </span>

                    <div className="marketplace-filter-options">
                      {filtros.map((item) => (
                        <button
                          key={item.valor}
                          type="button"
                          className={
                            filtro === item.valor
                              ? "marketplace-filter-option marketplace-filter-option--active"
                              : "marketplace-filter-option"
                          }
                          onClick={() =>
                            selecionarFiltro(
                              item.valor
                            )
                          }
                        >
                          <span>
                            {item.label}
                          </span>

                          {filtro === item.valor && (
                            <span
                              aria-hidden="true"
                              className="marketplace-filter-check"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ==================================================
                      FILTROS DE RESGATES
                  =================================================== */}

                  {contexto === "resgates" && (
                    <>
                      <div className="marketplace-filter-panel-divider" />

                      {/* ============================================
                          ORDENAÇÃO
                      ============================================= */}

                      <div className="marketplace-filter-section marketplace-filter-sort">
                        <span className="marketplace-filter-title">
                          Ordenar
                        </span>

                        <div className="marketplace-sort-control">
                          <select
                            value={ordenacao}
                            onChange={(event) =>
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

                      {/* ============================================
                          LIMITE DE PONTOS
                      ============================================= */}

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
                          value={pontosMax}
                          onChange={(event) =>
                            alterarPontosMax(
                              event.target.value
                            )
                          }
                          className="marketplace-points-range"
                          aria-label="Quantidade máxima de pontos"
                        />

                        <div className="marketplace-points-range-labels">
                          <span>0 pts</span>

                          <span>
                            500 pts
                          </span>
                        </div>

                        <span className="marketplace-filter-points-limit">
                          até {pontosMax} pts
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="marketplace-search-divider" />

            <label
              htmlFor="marketplace-search-input"
              className="sr-only"
            >
              Pesquisar anúncios
            </label>

            <input
              id="marketplace-search-input"
              type="search"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder={placeholder}
              autoComplete="off"
            />

            {busca && (
              <button
                type="button"
                className="marketplace-search-clear"
                onClick={() => setBusca("")}
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
              <IconSearch size={17} />
            </button>
          </form>
        )}

        {/* ====================================================
            BLOCO DO USUÁRIO
        ===================================================== */}

        <div className="marketplace-user-area">
          <span
            className="marketplace-user-avatar"
            aria-hidden="true"
          >
            {iniciais}
          </span>

          <span className="marketplace-user-greeting">
            <strong>
              Olá, {primeiroNome}! Vamos conectar?
            </strong>

            <span className="marketplace-user-community">
              Juntos, fazemos a comunidade circular.
            </span>
          </span>
        </div>

        {/* ====================================================
            AÇÕES DO USUÁRIO
        ===================================================== */}

        <div className="marketplace-user-actions">

          {/* ==================================================
              PONTOS
          =================================================== */}

          <button
            type="button"
            className="marketplace-action marketplace-points"
            aria-label="Saldo de pontos"
            title="Saldo de pontos"
            onClick={() =>
              navigate("/historico")
            }
          >
            <span className="marketplace-action-icon">
              <IconWallet size={18} />
            </span>

            <span className="marketplace-points-value">
               —
            </span>
          </button>

          {/* ==================================================
              NOTIFICAÇÕES
          =================================================== */}

          <div
            className="marketplace-action-wrapper"
            ref={notificacoesRef}
          >
            <button
              type="button"
              className="marketplace-action marketplace-notification-button"
              onClick={alternarNotificacoes}
              aria-label="Notificações"
              aria-haspopup="dialog"
              aria-expanded={
                notificacoesAbertas
              }
            >
              <span className="marketplace-action-icon">
                <IconBell size={18} />
              </span>

              <span className="marketplace-notification-count">
                0
              </span>
            </button>

            {notificacoesAbertas && (
              <div className="marketplace-notifications">
                <div className="marketplace-dropdown-header">
                  <strong>
                    Notificações
                  </strong>
                </div>

                <div className="marketplace-notifications-empty">
                  <span className="marketplace-notifications-empty-icon">
                    <IconBell size={24} />
                  </span>

                  <strong>
                    Tudo tranquilo por aqui
                  </strong>

                  <p>
                    Quando alguém demonstrar
                    interesse em um dos seus itens,
                    você verá a notificação aqui.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================
              MENU
          =================================================== */}

          <div
            className="marketplace-action-wrapper"
            ref={menuRef}
          >
            <button
              type="button"
              className="marketplace-action marketplace-menu-button"
              onClick={alternarMenu}
              aria-label="Abrir menu"
              aria-haspopup="menu"
              aria-expanded={menuAberto}
            >
              <span className="marketplace-menu-icon">
                <IconMenu size={19} />
              </span>
            </button>

            {menuAberto && (
              <div
                className="marketplace-user-menu"
                role="menu"
              >
                <div className="marketplace-user-menu-profile">
                  <div className="marketplace-user-menu-avatar">
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

                <div className="marketplace-menu-divider" />

                <button
                  type="button"
                  className="marketplace-menu-option"
                  onClick={irParaPerfil}
                  role="menuitem"
                >
                  <span className="marketplace-menu-option-icon">
                    <IconUser size={17} />
                  </span>

                  <span>
                    Meus dados
                  </span>
                </button>

                <button
                  type="button"
                  className="marketplace-menu-option"
                  onClick={irParaHistorico}
                  role="menuitem"
                >
                  <span className="marketplace-menu-option-icon">
                    <IconClipboard size={17} />
                  </span>

                  <span>
                    Histórico
                  </span>
                </button>

                <div className="marketplace-menu-divider" />

                <button
                  type="button"
                  className="marketplace-menu-option marketplace-menu-option--logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className="marketplace-menu-option-icon">
                    <IconLogout size={17} />
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