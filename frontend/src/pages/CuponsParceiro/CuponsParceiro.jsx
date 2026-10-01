import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import {
  IconTicket,
  IconCheck,
  IconX,
  IconPlus,
  IconEdit,
} from "../../components/Icons/Icons";

import api from "../../services/api";

import "./CuponsParceiro.css";


/* ============================================================
   CATEGORIAS
============================================================ */

const CATEGORIAS = {
  alimentacao: "Alimentação",
  cafeteria: "Cafeteria",
  papelaria: "Papelaria",
  lazer: "Lazer",
  servicos: "Serviços",
  outros: "Outros",
};


/* ============================================================
   FORMATAÇÃO
============================================================ */

function formatarData(data) {
  if (!data) {
    return "—";
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "—";
  }

  return dataObj.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


function formatarCategoria(categoria) {
  return (
    CATEGORIAS[categoria] ||
    categoria ||
    "Outros"
  );
}


/* ============================================================
   COMPONENTE
============================================================ */

function CuponsParceiro() {
  const navigate = useNavigate();


  /* ==========================================================
     ESTADOS
  ========================================================== */

  const [aba, setAba] = useState(
    "ativos"
  );

  const [busca, setBusca] = useState(
    ""
  );

  const [cupons, setCupons] = useState(
    []
  );

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState(
    ""
  );

  const [
    cupomEmAcao,
    setCupomEmAcao,
  ] = useState(null);

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] = useState("");


  /* ==========================================================
     CARREGAR CUPONS
  ========================================================== */

  const carregarCupons = useCallback(
    async () => {
      setCarregando(true);
      setErro("");
      setMensagemSucesso("");

      try {
        const resposta = await api.get(
          `/cupons/meus?ativos=${
            aba === "ativos"
          }`
        );

        setCupons(
          Array.isArray(
            resposta?.data?.cupons
          )
            ? resposta.data.cupons
            : []
        );

      } catch (error) {
        console.error(
          "Erro ao carregar cupons:",
          error
        );

        setErro(
          error?.response?.data?.erro ||
          "Não foi possível carregar seus cupons."
        );

        setCupons([]);

      } finally {
        setCarregando(false);
      }
    },
    [aba]
  );


  useEffect(() => {
    carregarCupons();
  }, [carregarCupons]);


  /* ==========================================================
     BUSCA LOCAL
  ========================================================== */

  const cuponsFiltrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase();

    if (!termo) {
      return cupons;
    }

    return cupons.filter(
      (cupom) => {
        const titulo =
          cupom?.titulo
            ?.toLowerCase() || "";

        const descricao =
          cupom?.descricao
            ?.toLowerCase() || "";

        const categoria =
          cupom?.categoria
            ?.toLowerCase() || "";

        return (
          titulo.includes(termo) ||
          descricao.includes(termo) ||
          categoria.includes(termo)
        );
      }
    );
  }, [
    busca,
    cupons,
  ]);


  /* ==========================================================
     ARQUIVAR
  ========================================================== */

  async function arquivarCupom(cupom) {
    if (!cupom?.id) {
      return;
    }

    const confirmar = window.confirm(
      `Arquivar o cupom "${cupom.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    setCupomEmAcao(
      `arquivar-${cupom.id}`
    );

    setErro("");
    setMensagemSucesso("");

    try {
      await api.patch(
        `/cupons/${cupom.id}/arquivar`
      );

      setMensagemSucesso(
        "Cupom arquivado com sucesso."
      );

      await carregarCupons();

    } catch (error) {
      console.error(
        "Erro ao arquivar cupom:",
        error
      );

      setErro(
        error?.response?.data?.erro ||
        "Não foi possível arquivar o cupom."
      );

    } finally {
      setCupomEmAcao(null);
    }
  }


  /* ==========================================================
     ATIVAR
  ========================================================== */

  async function ativarCupom(cupom) {
    if (!cupom?.id) {
      return;
    }

    setCupomEmAcao(
      `ativar-${cupom.id}`
    );

    setErro("");
    setMensagemSucesso("");

    try {
      await api.patch(
        `/cupons/${cupom.id}/ativar`
      );

      setMensagemSucesso(
        "Cupom ativado com sucesso."
      );

      await carregarCupons();

    } catch (error) {
      console.error(
        "Erro ao ativar cupom:",
        error
      );

      setErro(
        error?.response?.data?.erro ||
        "Não foi possível ativar o cupom."
      );

    } finally {
      setCupomEmAcao(null);
    }
  }


  /* ==========================================================
     EDITAR
  ========================================================== */

  function editarCupom(cupom) {
    if (!cupom?.id) {
      return;
    }

    /*
     * A rota de edição será criada
     * quando implementarmos a tela de edição.
     */

    navigate(
      `/parceiro/cupons/${cupom.id}/editar`
    );
  }


  /* ==========================================================
     NOVO CUPOM
  ========================================================== */

  function criarCupom() {
    navigate(
      "/parceiro/cupons/novo"
    );
  }


  /* ==========================================================
     VOLTAR PARA O DASHBOARD
  ========================================================== */

  function voltarParaDashboard() {
    navigate(
      "/parceiro/inicio"
    );
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="cupons-parceiro-page">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <MarketplaceNavbar
        tituloPagina="Meus cupons"
        aoVoltarPagina={
          voltarParaDashboard
        }
      />


      {/* ======================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <main className="cupons-parceiro-main">

        <div className="cupons-parceiro-container">


          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <header className="cupons-parceiro-header">

            <div>

              <span className="cupons-parceiro-eyebrow">
                BENEFÍCIOS
              </span>

              <h1>
                Meus cupons
              </h1>

              <p>
                Gerencie os benefícios oferecidos
                pela sua empresa à comunidade.
              </p>

            </div>


            <button
              type="button"
              className="cupons-parceiro-new-button"
              onClick={criarCupom}
            >

              <IconPlus
                size={19}
                aria-hidden="true"
              />

              <span>
                Novo cupom
              </span>

            </button>

          </header>


          {/* ==================================================
              MENSAGEM DE SUCESSO
          ================================================== */}

          {mensagemSucesso && (
            <div
              className="cupons-parceiro-feedback cupons-parceiro-feedback--success"
              role="status"
              aria-live="polite"
            >

              <IconCheck
                size={18}
                aria-hidden="true"
              />

              <span>
                {mensagemSucesso}
              </span>

            </div>
          )}


          {/* ==================================================
              ERRO
          ================================================== */}

          {erro && (
            <div
              className="cupons-parceiro-feedback cupons-parceiro-feedback--error"
              role="alert"
              aria-live="assertive"
            >

              <IconX
                size={18}
                aria-hidden="true"
              />

              <span>
                {erro}
              </span>

            </div>
          )}


          {/* ==================================================
              CONTROLES
          ================================================== */}

          <section
            className="cupons-parceiro-controls"
            aria-label="Filtros de cupons"
          >

            <div
              className="cupons-parceiro-tabs"
              role="tablist"
              aria-label="Status dos cupons"
            >

              <button
                type="button"
                role="tab"
                aria-selected={
                  aba === "ativos"
                }
                className={
                  aba === "ativos"
                    ? "cupons-parceiro-tab cupons-parceiro-tab--active"
                    : "cupons-parceiro-tab"
                }
                onClick={() => {
                  setAba("ativos");
                  setBusca("");
                }}
              >
                Ativos
              </button>


              <button
                type="button"
                role="tab"
                aria-selected={
                  aba === "arquivados"
                }
                className={
                  aba === "arquivados"
                    ? "cupons-parceiro-tab cupons-parceiro-tab--active"
                    : "cupons-parceiro-tab"
                }
                onClick={() => {
                  setAba("arquivados");
                  setBusca("");
                }}
              >
                Arquivados
              </button>

            </div>


            <div className="cupons-parceiro-search">

              <label
                htmlFor="busca-cupons-parceiro"
                className="sr-only"
              >
                Buscar cupom
              </label>

              <input
                id="busca-cupons-parceiro"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(
                    event.target.value
                  )
                }
                placeholder="Buscar cupom..."
                autoComplete="off"
              />

            </div>

          </section>


          {/* ==================================================
              RESUMO
          ================================================== */}

          {!carregando && !erro && (
            <div className="cupons-parceiro-summary">

              <span>
                {cuponsFiltrados.length}
                {" "}
                {cuponsFiltrados.length === 1
                  ? "cupom"
                  : "cupons"}
              </span>

              <span>
                {aba === "ativos"
                  ? "Publicados"
                  : "Arquivados"}
              </span>

            </div>
          )}


          {/* ==================================================
              CARREGANDO
          ================================================== */}

          {carregando && (
            <section
              className="cupons-parceiro-state"
              aria-live="polite"
              aria-busy="true"
            >

              <div
                className="cupons-parceiro-spinner"
                aria-hidden="true"
              />

              <p>
                Carregando seus cupons...
              </p>

            </section>
          )}


          {/* ==================================================
              ESTADO VAZIO
          ================================================== */}

          {!carregando &&
            !erro &&
            cuponsFiltrados.length === 0 && (

              <section
                className="cupons-parceiro-empty"
                aria-live="polite"
              >

                <div
                  className="cupons-parceiro-empty-icon"
                  aria-hidden="true"
                >

                  <IconTicket
                    size={32}
                  />

                </div>


                <span className="cupons-parceiro-empty-eyebrow">

                  {aba === "ativos"
                    ? "PUBLICADOS"
                    : "ARQUIVADOS"}

                </span>


                <h2>

                  {busca
                    ? "Nenhum cupom encontrado"
                    : aba === "ativos"
                      ? "Você ainda não publicou cupons"
                      : "Nenhum cupom arquivado"}

                </h2>


                <p>

                  {busca
                    ? "Tente buscar por outro nome ou categoria."
                    : aba === "ativos"
                      ? "Crie seu primeiro benefício para disponibilizá-lo aos usuários do ConectaBandeirante."
                      : "Os cupons que você arquivar aparecerão aqui."}

                </p>


                {aba === "ativos" &&
                  !busca && (

                    <button
                      type="button"
                      className="cupons-parceiro-empty-button"
                      onClick={criarCupom}
                    >

                      <IconPlus
                        size={18}
                        aria-hidden="true"
                      />

                      <span>
                        Criar primeiro cupom
                      </span>

                    </button>

                  )}

              </section>

            )}


          {/* ==================================================
              GRADE
          ================================================== */}

          {!carregando &&
            !erro &&
            cuponsFiltrados.length > 0 && (

              <section
                className="cupons-parceiro-grid"
                aria-label={
                  aba === "ativos"
                    ? "Cupons ativos"
                    : "Cupons arquivados"
                }
              >

                {cuponsFiltrados.map(
                  (cupom) => {

                    const acaoArquivar =
                      cupomEmAcao ===
                      `arquivar-${cupom.id}`;

                    const acaoAtivar =
                      cupomEmAcao ===
                      `ativar-${cupom.id}`;

                    const expirado =
                      cupom.validade_fim &&
                      new Date(
                        cupom.validade_fim
                      ) <= new Date();


                    return (

                      <article
                        key={cupom.id}
                        className={
                          cupom.ativo
                            ? "cupom-parceiro-card"
                            : "cupom-parceiro-card cupom-parceiro-card--archived"
                        }
                      >


                        {/* ==================================
                            IMAGEM
                        ================================== */}

                        <div className="cupom-parceiro-image">

                          {cupom.imagem_url ? (

                            <img
                              src={
                                cupom.imagem_url
                              }
                              alt=""
                            />

                          ) : (

                            <div
                              className="cupom-parceiro-image-placeholder"
                              aria-hidden="true"
                            >

                              <IconTicket
                                size={38}
                              />

                            </div>

                          )}


                          <span
                            className={
                              cupom.ativo
                                ? "cupom-parceiro-status cupom-parceiro-status--active"
                                : "cupom-parceiro-status cupom-parceiro-status--archived"
                            }
                          >

                            {cupom.ativo
                              ? "Ativo"
                              : "Arquivado"}

                          </span>

                        </div>


                        {/* ==================================
                            CONTEÚDO
                        ================================== */}

                        <div className="cupom-parceiro-content">

                          <span className="cupom-parceiro-category">

                            {formatarCategoria(
                              cupom.categoria
                            )}

                          </span>


                          <h2>
                            {cupom.titulo}
                          </h2>


                          <p className="cupom-parceiro-description">
                            {cupom.descricao}
                          </p>


                          {/* =================================
                              PONTOS
                          ================================= */}

                          <div className="cupom-parceiro-points">

                            <strong>
                              {cupom.pontos}
                            </strong>

                            <span>
                              pontos
                            </span>

                          </div>


                          {/* =================================
                              DETALHES
                          ================================= */}

                          <dl className="cupom-parceiro-details">

                            <div>

                              <dt>
                                Validade
                              </dt>

                              <dd>

                                {formatarData(
                                  cupom.validade_inicio
                                )}

                                {" "}
                                até
                                {" "}

                                {formatarData(
                                  cupom.validade_fim
                                )}

                              </dd>

                            </div>


                            <div>

                              <dt>
                                Limite
                              </dt>

                              <dd>

                                {cupom.limite_resgates ??
                                  "Sem limite"}

                              </dd>

                            </div>

                          </dl>


                          {/* =================================
                              EXPIRADO
                          ================================= */}

                          {expirado && (

                            <span className="cupom-parceiro-expired">

                              Cupom expirado

                            </span>

                          )}


                          {/* =================================
                              AÇÕES
                          ================================= */}

                          <div className="cupom-parceiro-actions">

                            {cupom.ativo ? (

                              <>

                                <button
                                  type="button"
                                  className="cupom-parceiro-action cupom-parceiro-action--secondary"
                                  onClick={() =>
                                    editarCupom(
                                      cupom
                                    )
                                  }
                                >

                                  <IconEdit
                                    size={17}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    Editar
                                  </span>

                                </button>


                                <button
                                  type="button"
                                  className="cupom-parceiro-action cupom-parceiro-action--archive"
                                  onClick={() =>
                                    arquivarCupom(
                                      cupom
                                    )
                                  }
                                  disabled={
                                    Boolean(
                                      cupomEmAcao
                                    )
                                  }
                                >

                                  <IconX
                                    size={17}
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {acaoArquivar
                                      ? "Arquivando..."
                                      : "Arquivar"}
                                  </span>

                                </button>

                              </>

                            ) : (

                              <button
                                type="button"
                                className="cupom-parceiro-action cupom-parceiro-action--activate"
                                onClick={() =>
                                  ativarCupom(
                                    cupom
                                  )
                                }
                                disabled={
                                  Boolean(
                                    cupomEmAcao
                                  )
                                }
                              >

                                <IconCheck
                                  size={17}
                                  aria-hidden="true"
                                />

                                <span>
                                  {acaoAtivar
                                    ? "Ativando..."
                                    : "Ativar"}
                                </span>

                              </button>

                            )}

                          </div>

                        </div>

                      </article>

                    );
                  }
                )}

              </section>

            )}

        </div>

      </main>


      {/* ======================================================
          NAVEGAÇÃO INFERIOR
      ====================================================== */}

      <BottomNavigation
        tipo="parceiro"
      />

    </div>
  );
}


export default CuponsParceiro;