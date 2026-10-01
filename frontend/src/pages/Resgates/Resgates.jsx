import {
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
  IconGift,
  IconChevronDown,
  IconCheck,
  IconX,
} from "../../components/Icons/Icons";

import api from "../../services/api";

import "./Resgates.css";


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
   COMPONENTE
============================================================ */

function Resgates() {
  const navigate = useNavigate();


  /*
   * ============================================================
   * USUÁRIO
   * ============================================================
   */

  const pessoa = JSON.parse(
    localStorage.getItem("usuario") ||
      localStorage.getItem("parceiro") ||
      "null"
  );


  /*
   * ============================================================
   * BUSCA
   * ============================================================
   */

  const [busca, setBusca] = useState("");


  /*
   * ============================================================
   * VISUALIZAÇÃO
   * ============================================================
   */

  const [visualizacao, setVisualizacao] =
    useState("grade");


  /*
   * ============================================================
   * FILTROS
   * ============================================================
   */

  const [filtroAberto, setFiltroAberto] =
    useState(false);

  const [ordenacao, setOrdenacao] =
    useState("mais_recente");


  /*
   * ============================================================
   * CUPONS
   * ============================================================
   */

  const [cupons, setCupons] = useState([]);


  /*
   * ============================================================
   * ESTADO DA API
   * ============================================================
   */

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");


  /*
   * ============================================================
   * SALDO
   *
   * O backend de pontos ainda não está implementado.
   *
   * Quando o campo estiver disponível no usuário, o componente
   * poderá utilizar pessoa.pontos automaticamente.
   * ============================================================
   */

  const pontosDisponiveis =
    pessoa?.pontos ?? null;


  /*
   * ============================================================
   * NICHOS
   *
   * Os nichos continuam sendo uma estrutura visual preparada
   * para futuras categorias/parceiros.
   *
   * Eles não representam necessariamente parceiros cadastrados.
   * ============================================================
   */

  const nichos = [
    {
      id: "alimentacao",
      nome: "Alimentação",
      descricao:
        "Lanches, restaurantes e benefícios",
    },
    {
      id: "cafeteria",
      nome: "Cafeteria",
      descricao:
        "Cafés, doces e momentos especiais",
    },
    {
      id: "papelaria",
      nome: "Papelaria",
      descricao:
        "Materiais escolares e descontos",
    },
    {
      id: "moda",
      nome: "Moda",
      descricao:
        "Roupas, acessórios e serviços",
    },
    {
      id: "lazer",
      nome: "Lazer",
      descricao:
        "Cinema, jogos e entretenimento",
    },
    {
      id: "beleza",
      nome: "Beleza",
      descricao:
        "Cuidados pessoais e estética",
    },
    {
      id: "cultura",
      nome: "Cultura",
      descricao:
        "Livros, eventos e experiências",
    },
    {
      id: "servicos",
      nome: "Serviços",
      descricao:
        "Serviços oferecidos por parceiros",
    },
  ];


  /*
   * ============================================================
   * CARREGAR CUPONS PÚBLICOS
   * ============================================================
   *
   * O backend disponibiliza:
   *
   * GET /api/cupons/publicos
   *
   * Essa rota já retorna somente cupons:
   *
   * - ativos;
   * - cuja validade já começou;
   * - cuja validade ainda não terminou.
   *
   * Portanto, não precisamos reproduzir essa regra no frontend.
   * ============================================================
   */

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarCupons() {
      setCarregando(true);
      setErro("");

      try {
        const resposta =
          await api.get(
            "/cupons/publicos"
          );

        const cuponsRecebidos =
          Array.isArray(
            resposta?.data?.cupons
          )
            ? resposta.data.cupons
            : [];

        if (!componenteAtivo) {
          return;
        }

        setCupons(
          cuponsRecebidos
        );

      } catch (error) {
        console.error(
          "Erro ao carregar cupons públicos:",
          error
        );

        if (!componenteAtivo) {
          return;
        }

        setCupons([]);

        setErro(
          error?.response?.data?.erro ||
            "Não foi possível carregar os benefícios disponíveis."
        );

      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    carregarCupons();

    return () => {
      componenteAtivo = false;
    };
  }, []);


  /*
   * ============================================================
   * FORMATAÇÃO
   * ============================================================
   */

  function formatarCategoria(
    categoria
  ) {
    return (
      CATEGORIAS[categoria] ||
      categoria ||
      "Outros"
    );
  }


  function formatarData(
    data
  ) {
    if (!data) {
      return "—";
    }

    const dataObj =
      new Date(data);

    if (
      Number.isNaN(
        dataObj.getTime()
      )
    ) {
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


  /*
   * ============================================================
   * FILTRAGEM E ORDENAÇÃO
   * ============================================================
   */

  const cuponsFiltrados =
    useMemo(() => {
      let resultado =
        [...cupons];


      /*
       * BUSCA
       */

      if (
        busca.trim()
      ) {
        const termo =
          busca
            .trim()
            .toLowerCase();

        resultado =
          resultado.filter(
            (cupom) => {
              const titulo =
                cupom?.titulo
                  ?.toLowerCase() ||
                "";

              const descricao =
                cupom?.descricao
                  ?.toLowerCase() ||
                "";

              const categoria =
                cupom?.categoria
                  ?.toLowerCase() ||
                "";

              /*
               * O endpoint público atualmente não retorna
               * o nome do parceiro, apenas parceiro_id.
               *
               * Por isso a busca trabalha com os campos que
               * realmente estão disponíveis na API.
               */

              return (
                titulo.includes(
                  termo
                ) ||
                descricao.includes(
                  termo
                ) ||
                categoria.includes(
                  termo
                ) ||
                formatarCategoria(
                  cupom?.categoria
                )
                  .toLowerCase()
                  .includes(termo)
              );
            }
          );
      }


      /*
       * ORDENAÇÃO
       */

      if (
        ordenacao ===
        "maior_valor"
      ) {
        resultado.sort(
          (a, b) =>
            Number(
              b?.pontos ?? 0
            ) -
            Number(
              a?.pontos ?? 0
            )
        );
      }


      if (
        ordenacao ===
        "menor_valor"
      ) {
        resultado.sort(
          (a, b) =>
            Number(
              a?.pontos ?? 0
            ) -
            Number(
              b?.pontos ?? 0
            )
        );
      }


      if (
        ordenacao ===
        "mais_recente"
      ) {
        resultado.sort(
          (a, b) =>
            new Date(
              b?.criado_em ?? 0
            ) -
            new Date(
              a?.criado_em ?? 0
            )
        );
      }


      return resultado;

    }, [
      busca,
      ordenacao,
      cupons,
    ]);


  /*
   * ============================================================
   * OPÇÕES DE ORDENAÇÃO
   * ============================================================
   */

  const opcoesOrdenacao = [
    {
      valor: "mais_recente",
      label: "Mais recentes",
    },
    {
      valor: "maior_valor",
      label: "Maior valor em pontos",
    },
    {
      valor: "menor_valor",
      label: "Menor valor em pontos",
    },
  ];


  const ordenacaoSelecionada =
    opcoesOrdenacao.find(
      (opcao) =>
        opcao.valor ===
        ordenacao
    ) ||
    opcoesOrdenacao[0];


  /*
   * ============================================================
   * NAVEGAÇÃO POR NICHO
   * ============================================================
   *
   * A filtragem por nicho ainda não possui uma mecânica própria.
   *
   * Como os cupons reais já possuem categoria, podemos utilizar
   * a busca existente para selecionar a categoria visualmente.
   *
   * Assim não criamos uma rota que ainda não existe.
   * ============================================================
   */

  function irParaNicho(
    nicho
  ) {
    setBusca(
      nicho.nome
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="resgates-page">

      <MarketplaceNavbar
        pessoa={pessoa}
        busca={busca}
        setBusca={setBusca}
        contexto="resgates"
      />


      <main className="resgates-content">

        {/* ==================================================
            CABEÇALHO
        =================================================== */}

        <section className="resgates-header">

          <div className="resgates-title-area">

            <button
              type="button"
              className="resgates-back-button"
              onClick={() =>
                navigate(
                  "/inicio"
                )
              }
              aria-label="Voltar para anúncios"
              title="Voltar"
            >

              <span aria-hidden="true">
                ←
              </span>

            </button>


            <div>

              <span className="resgates-eyebrow">
                PONTOS CONECTA
              </span>

              <h1>
                Resgates
              </h1>

              <p>
                Troque seus pontos por
                benefícios oferecidos
                pela comunidade.
              </p>

            </div>

          </div>


          <div className="resgates-balance">

            <IconTicket
              size={22}
              aria-hidden="true"
            />

            <div>

              <span>
                Seu saldo
              </span>

              <strong>
                {pontosDisponiveis !== null
                  ? `${pontosDisponiveis} pontos`
                  : "Saldo indisponível"}
              </strong>

            </div>

          </div>

        </section>


        {/* ==================================================
            NICHOS
        =================================================== */}

        <section className="resgates-nichos">

          <div className="resgates-section-heading">

            <div>

              <h2>
                Encontre por categoria
              </h2>

              <p>
                Benefícios oferecidos por
                parceiros da comunidade.
              </p>

            </div>

          </div>


          <div className="resgates-nichos-list">

            {nichos.map(
              (nicho) => (

                <button
                  key={nicho.id}
                  type="button"
                  className="resgates-nicho"
                  onClick={() =>
                    irParaNicho(
                      nicho
                    )
                  }
                  aria-label={`Buscar benefícios de ${nicho.nome}`}
                >

                  <span className="resgates-nicho-icon">

                    <IconGift
                      size={19}
                      aria-hidden="true"
                    />

                  </span>


                  <span className="resgates-nicho-content">

                    <strong>
                      {nicho.nome}
                    </strong>

                    <small>
                      {nicho.descricao}
                    </small>

                  </span>

                </button>

              )
            )}

          </div>

        </section>


        {/* ==================================================
            BARRA DE CONTROLE
        =================================================== */}

        <section className="resgates-controls">

          <div className="resgates-controls-title">

            <div>

              <span className="resgates-eyebrow">
                BENEFÍCIOS
              </span>

              <h2>
                Cupons disponíveis
              </h2>

            </div>


            <div
              className="resgates-view-toggle"
              aria-label="Modo de visualização"
            >

              <button
                type="button"
                className={
                  visualizacao ===
                  "grade"
                    ? "resgates-view-button resgates-view-button--active"
                    : "resgates-view-button"
                }
                onClick={() =>
                  setVisualizacao(
                    "grade"
                  )
                }
                aria-label="Visualização em grade"
                title="Visualização em grade"
                aria-pressed={
                  visualizacao ===
                  "grade"
                }
              >
                ▦
              </button>


              <button
                type="button"
                className={
                  visualizacao ===
                  "linha"
                    ? "resgates-view-button resgates-view-button--active"
                    : "resgates-view-button"
                }
                onClick={() =>
                  setVisualizacao(
                    "linha"
                  )
                }
                aria-label="Visualização em lista"
                title="Visualização em lista"
                aria-pressed={
                  visualizacao ===
                  "linha"
                }
              >
                ☰
              </button>

            </div>

          </div>


          {/* ==================================================
              FILTRO
          =================================================== */}

          <div className="resgates-filter-wrapper">

            <button
              type="button"
              className="resgates-filter-button"
              onClick={() =>
                setFiltroAberto(
                  (estado) =>
                    !estado
                )
              }
              aria-expanded={
                filtroAberto
              }
              aria-haspopup="true"
            >

              <span>
                {
                  ordenacaoSelecionada.label
                }
              </span>

              <IconChevronDown
                size={15}
                aria-hidden="true"
              />

            </button>


            {filtroAberto && (

              <div
                className="resgates-filter-dropdown"
                role="menu"
              >

                <div className="resgates-filter-title">

                  <strong>
                    Ordenar por
                  </strong>

                </div>


                {opcoesOrdenacao.map(
                  (opcao) => (

                    <button
                      key={
                        opcao.valor
                      }
                      type="button"
                      role="menuitemradio"
                      aria-checked={
                        ordenacao ===
                        opcao.valor
                      }
                      className={
                        ordenacao ===
                        opcao.valor
                          ? "resgates-filter-option resgates-filter-option--active"
                          : "resgates-filter-option"
                      }
                      onClick={() => {

                        setOrdenacao(
                          opcao.valor
                        );

                        setFiltroAberto(
                          false
                        );

                      }}
                    >

                      <span>
                        {
                          opcao.label
                        }
                      </span>


                      {ordenacao ===
                        opcao.valor && (

                        <IconCheck
                          size={16}
                          aria-hidden="true"
                        />

                      )}

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            CARREGANDO
        =================================================== */}

        {carregando && (

          <section
            className="resgates-empty"
            aria-live="polite"
          >

            <div className="resgates-empty-icon">

              <IconTicket
                size={36}
                aria-hidden="true"
              />

            </div>

            <span className="resgates-empty-label">
              CARREGANDO
            </span>

            <h2>
              Buscando benefícios
            </h2>

            <p>
              Estamos carregando os cupons
              disponíveis para a comunidade.
            </p>

          </section>

        )}


        {/* ==================================================
            ERRO
        =================================================== */}

        {!carregando &&
          erro && (

            <section
              className="resgates-empty"
              role="alert"
            >

              <div className="resgates-empty-icon">

                <IconX
                  size={36}
                  aria-hidden="true"
                />

              </div>

              <span className="resgates-empty-label">
                ATENÇÃO
              </span>

              <h2>
                Não foi possível carregar os benefícios
              </h2>

              <p>
                {erro}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Tentar novamente
              </button>

            </section>

          )}


        {/* ==================================================
            RESULTADOS
        =================================================== */}

        {!carregando &&
          !erro &&
          cuponsFiltrados.length >
            0 && (

            <section
              className={
                visualizacao ===
                "grade"
                  ? "resgates-coupons resgates-coupons--grid"
                  : "resgates-coupons resgates-coupons--list"
              }
              aria-label="Cupons disponíveis"
            >

              {cuponsFiltrados.map(
                (cupom) => {

                  const categoria =
                    formatarCategoria(
                      cupom?.categoria
                    );

                  const validade =
                    formatarData(
                      cupom?.validade_fim
                    );

                  return (

                    <article
                      key={
                        cupom.id
                      }
                      className="resgate-card"
                    >

                      {/* ==================================
                          IMAGEM
                      ================================== */}

                      <div className="resgate-card-image">

                        {cupom?.imagem_url ? (

                          <img
                            src={
                              cupom.imagem_url
                            }
                            alt=""
                            loading="lazy"
                          />

                        ) : (

                          <IconTicket
                            size={34}
                            aria-hidden="true"
                          />

                        )}

                      </div>


                      {/* ==================================
                          CONTEÚDO
                      ================================== */}

                      <div className="resgate-card-content">

                        <span>
                          {categoria}
                        </span>


                        <h3>
                          {cupom.titulo}
                        </h3>


                        <p>
                          {cupom.descricao}
                        </p>


                        <div className="resgate-card-footer">

                          <div>

                            <strong>
                              {cupom.pontos} pts
                            </strong>

                            <small>
                              válido até{" "}
                              {validade}
                            </small>

                          </div>


                          {/*
                           * A mecânica de resgate ainda não
                           * está implementada.
                           *
                           * Por isso não criamos uma rota falsa
                           * nem descontamos pontos.
                           */}

                          <button
                            type="button"
                            disabled
                            title="A mecânica de resgate será disponibilizada em breve."
                          >
                            Em breve
                          </button>

                        </div>

                      </div>

                    </article>

                  );
                }
              )}

            </section>

          )}


        {/* ==================================================
            NENHUM RESULTADO APÓS FILTRO
        =================================================== */}

        {!carregando &&
          !erro &&
          cupons.length > 0 &&
          cuponsFiltrados.length ===
            0 && (

            <section className="resgates-empty">

              <div className="resgates-empty-icon">

                <IconTicket
                  size={36}
                  aria-hidden="true"
                />

              </div>

              <span className="resgates-empty-label">
                BUSCA
              </span>

              <h2>
                Nenhum benefício encontrado
              </h2>

              <p>
                Não encontramos cupons
                correspondentes à sua busca.
                Tente outro termo ou categoria.
              </p>

              <button
                type="button"
                onClick={() =>
                  setBusca("")
                }
              >
                Limpar busca
              </button>

            </section>

          )}


        {/* ==================================================
            NENHUM CUPOM NO BACKEND
        =================================================== */}

        {!carregando &&
          !erro &&
          cupons.length ===
            0 && (

            <section className="resgates-empty">

              <div className="resgates-empty-icon">

                <IconTicket
                  size={36}
                  aria-hidden="true"
                />

              </div>

              <span className="resgates-empty-label">
                EM BREVE
              </span>

              <h2>
                Ainda não há cupons disponíveis
              </h2>

              <p>
                Estamos preparando o espaço
                para que parceiros da comunidade
                possam oferecer benefícios em
                troca dos seus pontos.
              </p>


              <div className="resgates-empty-niches">

                <span>
                  Alimentação
                </span>

                <span>
                  Cafeteria
                </span>

                <span>
                  Papelaria
                </span>

                <span>
                  Lazer
                </span>

              </div>

            </section>

          )}

      </main>


      <BottomNavigation />

    </div>
  );
}


export default Resgates;