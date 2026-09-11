import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import {
  IconTicket,
  IconGift,
  IconChevronDown,
  IconCheck,
} from "../../components/Icons/Icons";

import "./Resgates.css";

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

  const [visualizacao, setVisualizacao] = useState("grade");

  /*
   * ============================================================
   * FILTROS
   * ============================================================
   */

  const [filtroAberto, setFiltroAberto] = useState(false);

  const [ordenacao, setOrdenacao] = useState(
    "mais_recente"
  );

  /*
   * ============================================================
   * PONTOS
   *
   * O backend ainda não possui o campo de pontos.
   *
   * Por isso, não existe saldo fictício nem filtro visual
   * de pontos neste momento.
   *
   * Quando o backend estiver pronto, o saldo poderá ser obtido
   * diretamente de:
   *
   * pessoa?.pontos
   *
   * ============================================================
   */

  const pontosDisponiveis =
    pessoa?.pontos ?? null;

  /*
   * ============================================================
   * NICHOS
   *
   * Estes são apenas os nichos que o Conecta poderá receber.
   * Eles não representam parceiros cadastrados atualmente.
   *
   * Posteriormente, essas categorias podem vir do backend.
   * ============================================================
   */

  const nichos = [
    {
      id: "alimentacao",
      nome: "Alimentação",
      descricao: "Lanches, restaurantes e benefícios",
    },
    {
      id: "cafeteria",
      nome: "Cafeteria",
      descricao: "Cafés, doces e momentos especiais",
    },
    {
      id: "papelaria",
      nome: "Papelaria",
      descricao: "Materiais escolares e descontos",
    },
    {
      id: "moda",
      nome: "Moda",
      descricao: "Roupas, acessórios e serviços",
    },
    {
      id: "lazer",
      nome: "Lazer",
      descricao: "Cinema, jogos e entretenimento",
    },
    {
      id: "beleza",
      nome: "Beleza",
      descricao: "Cuidados pessoais e estética",
    },
    {
      id: "cultura",
      nome: "Cultura",
      descricao: "Livros, eventos e experiências",
    },
    {
      id: "servicos",
      nome: "Serviços",
      descricao: "Serviços oferecidos por parceiros",
    },
  ];

  /*
   * ============================================================
   * CUPONS
   *
   * Atualmente vazio porque ainda não existe endpoint de
   * benefícios/resgates no backend.
   *
   * Quando a API estiver pronta, os dados poderão seguir
   * esta estrutura:
   *
   * {
   *   id: 1,
   *   titulo: "10% de desconto no café",
   *   descricao: "Válido para membros da comunidade",
   *   parceiro: "Nome do parceiro",
   *   categoria: "cafeteria",
   *   pontos: 80,
   *   imagem: "...",
   *   validade: "2026-12-31",
   *   criado_em: "2026-09-10"
   * }
   *
   * O campo "pontos" já está previsto na estrutura futura,
   * mas não é utilizado enquanto não existir no backend.
   * ============================================================
   */

  const [cupons, setCupons] = useState([]);

  /*
   * ============================================================
   * FILTRAGEM
   * ============================================================
   */

  const cuponsFiltrados = useMemo(() => {
    let resultado = [...cupons];

    /*
     * BUSCA
     */

    if (busca.trim()) {
      const termo = busca
        .trim()
        .toLowerCase();

      resultado = resultado.filter((cupom) => {
        return (
          cupom.titulo
            ?.toLowerCase()
            .includes(termo) ||
          cupom.parceiro
            ?.toLowerCase()
            .includes(termo) ||
          cupom.categoria
            ?.toLowerCase()
            .includes(termo)
        );
      });
    }

    /*
     * ORDENAÇÃO
     *
     * As ordenações por pontos ficam preparadas para quando
     * o backend passar a fornecer esse campo.
     */

    if (ordenacao === "maior_valor") {
      resultado.sort(
        (a, b) =>
          Number(b.pontos ?? 0) -
          Number(a.pontos ?? 0)
      );
    }

    if (ordenacao === "menor_valor") {
      resultado.sort(
        (a, b) =>
          Number(a.pontos ?? 0) -
          Number(b.pontos ?? 0)
      );
    }

    if (ordenacao === "mais_recente") {
      resultado.sort(
        (a, b) =>
          new Date(b.criado_em ?? 0) -
          new Date(a.criado_em ?? 0)
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
        opcao.valor === ordenacao
    ) || opcoesOrdenacao[0];

  /*
   * ============================================================
   * NAVEGAÇÃO
   * ============================================================
   */

  function irParaNicho(nicho) {
    /*
     * Ainda não existe uma listagem de parceiros por categoria
     * no backend.
     *
     * O identificador já está preparado para essa futura
     * implementação.
     *
     * Futuramente poderá ser algo como:
     *
     * setNicho(nicho.id)
     *
     * ou navegação para uma rota específica.
     */

    console.log(
      "Nicho selecionado:",
      nicho.id
    );
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
              onClick={() => navigate("/inicio")}
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
                Troque seus pontos por benefícios
                oferecidos pela comunidade.
              </p>

            </div>

          </div>

          <div className="resgates-balance">

            <IconTicket size={22} />

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
                Parceiros que poderão fazer parte
                do Conecta.
              </p>

            </div>

          </div>

          <div className="resgates-nichos-list">

            {nichos.map((nicho) => (

              <button
                key={nicho.id}
                type="button"
                className="resgates-nicho"
                onClick={() =>
                  irParaNicho(nicho)
                }
              >

                <span className="resgates-nicho-icon">

                  <IconGift size={19} />

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

            ))}

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

            <div className="resgates-view-toggle">

              <button
                type="button"
                className={
                  visualizacao === "grade"
                    ? "resgates-view-button resgates-view-button--active"
                    : "resgates-view-button"
                }
                onClick={() =>
                  setVisualizacao("grade")
                }
                aria-label="Visualização em grade"
                title="Visualização em grade"
              >
                ▦
              </button>

              <button
                type="button"
                className={
                  visualizacao === "linha"
                    ? "resgates-view-button resgates-view-button--active"
                    : "resgates-view-button"
                }
                onClick={() =>
                  setVisualizacao("linha")
                }
                aria-label="Visualização em lista"
                title="Visualização em lista"
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
                  (estado) => !estado
                )
              }
              aria-expanded={filtroAberto}
            >

              <span>
                {ordenacaoSelecionada.label}
              </span>

              <IconChevronDown
                size={15}
              />

            </button>

            {filtroAberto && (

              <div className="resgates-filter-dropdown">

                <div className="resgates-filter-title">

                  <strong>
                    Ordenar por
                  </strong>

                </div>

                {opcoesOrdenacao.map(
                  (opcao) => (

                    <button
                      key={opcao.valor}
                      type="button"
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
                        {opcao.label}
                      </span>

                      {ordenacao ===
                        opcao.valor && (

                        <IconCheck
                          size={16}
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
            RESULTADOS
        =================================================== */}

        {cuponsFiltrados.length > 0 ? (

          <section
            className={
              visualizacao === "grade"
                ? "resgates-coupons resgates-coupons--grid"
                : "resgates-coupons resgates-coupons--list"
            }
          >

            {cuponsFiltrados.map(
              (cupom) => (

                <article
                  key={cupom.id}
                  className="resgate-card"
                >

                  <div className="resgate-card-image">

                    {cupom.imagem ? (

                      <img
                        src={cupom.imagem}
                        alt=""
                      />

                    ) : (

                      <IconTicket
                        size={34}
                      />

                    )}

                  </div>

                  <div className="resgate-card-content">

                    <span>
                      {cupom.parceiro}
                    </span>

                    <h3>
                      {cupom.titulo}
                    </h3>

                    <p>
                      {cupom.descricao}
                    </p>

                    <div className="resgate-card-footer">

                      <strong>
                        {cupom.pontos} pts
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/parceiros/${cupom.id}`
                          )
                        }
                      >
                        Ver benefício
                      </button>

                    </div>

                  </div>

                </article>

              )
            )}

          </section>

        ) : (

          /* ==================================================
             ESTADO VAZIO
          ================================================== */

          <section className="resgates-empty">

            <div className="resgates-empty-icon">

              <IconTicket size={36} />

            </div>

            <span className="resgates-empty-label">
              EM BREVE
            </span>

            <h2>
              Ainda não há cupons disponíveis
            </h2>

            <p>
              Estamos preparando o espaço para que
              parceiros da comunidade possam oferecer
              benefícios em troca dos seus pontos.
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