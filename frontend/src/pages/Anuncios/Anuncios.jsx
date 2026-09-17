import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation.jsx";
import CuponsCarousel from "../../components/CuponsCarousel/CuponsCarousel.jsx";
import api from "../../services/api";

import "./Anuncios.css";

const MODALIDADES = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "doacao", rotulo: "Doação" },
  { valor: "troca", rotulo: "Troca" },
  { valor: "venda", rotulo: "Venda" },
];

function Anuncios() {
  const navigate = useNavigate();

  const [anuncios, setAnuncios] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  const parceiro = JSON.parse(
    localStorage.getItem("parceiro")
  );

  const pessoa = usuario || parceiro;

  useEffect(() => {
    if (!pessoa) {
      navigate("/login", { replace: true });
      return;
    }

    carregarAnuncios();
  }, []);

  async function carregarAnuncios() {
    try {
      const resposta = await api.get("/anuncios");

      setAnuncios(resposta.data);
    } catch (error) {
      setErro(
        "Não foi possível carregar os anúncios."
      );
    } finally {
      setCarregando(false);
    }
  }

  const termoBusca = busca.trim();
  const estaBuscando = termoBusca.length > 0;

  function anuncioVisivel(anuncio) {
    const termo = termoBusca.toLowerCase();

    const correspondeBusca =
      !termo ||
      anuncio.titulo
        ?.toLowerCase()
        .includes(termo) ||
      anuncio.descricao
        ?.toLowerCase()
        .includes(termo) ||
      anuncio.categoria
        ?.toLowerCase()
        .includes(termo) ||
      anuncio.condicao
        ?.toLowerCase()
        .includes(termo) ||
      anuncio.publicado_por
        ?.toLowerCase()
        .includes(termo);

    const correspondeFiltro =
      filtro === "todos" ||
      anuncio.modalidade === filtro;

    return (
      correspondeBusca &&
      correspondeFiltro
    );
  }

  const anunciosFiltrados =
    anuncios.filter(anuncioVisivel);

  function obterImagemPrincipal(anuncio) {
    if (
      Array.isArray(anuncio.imagens) &&
      anuncio.imagens.length > 0
    ) {
      const primeiraImagem =
        anuncio.imagens[0];

      if (
        typeof primeiraImagem === "string"
      ) {
        return primeiraImagem;
      }

      return primeiraImagem?.url || null;
    }

    /*
     * Compatibilidade temporária com anúncios
     * antigos que eventualmente ainda possuam
     * o campo "imagem".
     */
    return anuncio.imagem || null;
  }

  function quantidadeImagens(anuncio) {
    if (
      Array.isArray(anuncio.imagens)
    ) {
      return anuncio.imagens.length;
    }

    return anuncio.imagem ? 1 : 0;
  }

  function obterTextoModalidade(modalidade) {
    if (modalidade === "doacao") {
      return "Doação";
    }

    if (modalidade === "troca") {
      return "Troca";
    }

    return "Venda";
  }

  function obterTextoCondicao(condicao) {
    if (condicao === "novo") {
      return "Novo";
    }

    if (condicao === "bom_estado") {
      return "Bom estado";
    }

    if (condicao === "usado") {
      return "Usado";
    }

    return "Não informado";
  }

  /*
   * Mensagem de estado vazio muda de acordo com o
   * contexto: busca sem resultado, filtro de categoria
   * sem itens, ou marketplace realmente sem anúncios.
   * Isso evita instruções genéricas que não ajudam
   * a pessoa a entender o que fazer a seguir.
   */
  const mensagemVazio = useMemo(() => {
    if (estaBuscando) {
      return {
        titulo: "Nenhum resultado encontrado",
        texto: `Não encontramos itens para "${termoBusca}". Tente outro termo ou revise o filtro selecionado.`,
      };
    }

    if (filtro !== "todos") {
      return {
        titulo: "Nenhum item nessa categoria",
        texto: 'Experimente outra categoria ou volte para "Todos".',
      };
    }

    return {
      titulo: "Nenhum item disponível",
      texto: "Ainda não há anúncios publicados na comunidade.",
    };
  }, [estaBuscando, termoBusca, filtro]);

  return (
    <main className="anuncios-page">
      <MarketplaceNavbar
        pessoa={pessoa}
        busca={busca}
        setBusca={setBusca}
        filtro={filtro}
        setFiltro={setFiltro}
      />

      <section className="market-content">
        {!estaBuscando && <CuponsCarousel />}

        {!estaBuscando && (
          <div className="market-welcome">
            <span>
              Conecta Bandeirante
            </span>

            <h1>
              Encontre o que precisa.
            </h1>

            <p>
              Materiais que podem ganhar um novo uso
              dentro da nossa comunidade.
            </p>
          </div>
        )}

        <div className="market-filter-section">
          <div className="market-filter-heading">
            <h2>
              {estaBuscando
                ? "Resultados"
                : "Itens disponíveis"}
            </h2>

            {!carregando && (
              <span
                className="market-filter-count"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {anunciosFiltrados.length}{" "}
                {anunciosFiltrados.length === 1
                  ? "item"
                  : "itens"}
              </span>
            )}
          </div>

          {estaBuscando && (
            <div className="market-search-feedback">
              <p className="market-filter-subtitle">
                Mostrando resultados para{" "}
                <strong>"{termoBusca}"</strong>
              </p>

              <button
                type="button"
                className="market-clear-search"
                onClick={() => setBusca("")}
              >
                <span aria-hidden="true">✕</span>
                Limpar busca
              </button>
            </div>
          )}

          <div
            className="market-filter-tags"
            role="group"
            aria-label="Filtrar itens por modalidade"
          >
            {MODALIDADES.map((modalidade) => (
              <button
                key={modalidade.valor}
                type="button"
                className={`filter-tag ${
                  filtro === modalidade.valor
                    ? "filter-tag--active"
                    : ""
                }`}
                aria-pressed={
                  filtro === modalidade.valor
                }
                onClick={() =>
                  setFiltro(modalidade.valor)
                }
              >
                {modalidade.rotulo}
              </button>
            ))}
          </div>
        </div>

        {carregando && (
          <div
            className="market-feedback"
            role="status"
            aria-live="polite"
          >
            Carregando itens...
          </div>
        )}

        {!carregando && erro && (
          <div
            className="market-feedback market-feedback--error"
            role="alert"
          >
            {erro}
          </div>
        )}

        {!carregando &&
          !erro &&
          anunciosFiltrados.length === 0 && (
            <div className="market-empty">
              <div
                className="market-empty-icon"
                aria-hidden="true"
              >
                🔎
              </div>

              <h2>
                {mensagemVazio.titulo}
              </h2>

              <p>
                {mensagemVazio.texto}
              </p>
            </div>
          )}

        {!carregando &&
          !erro &&
          anunciosFiltrados.length > 0 && (
            <section
              className="market-grid"
              aria-label="Lista de anúncios"
            >
              {anunciosFiltrados.map(
                (anuncio) => {
                  const imagemPrincipal =
                    obterImagemPrincipal(anuncio);

                  const totalImagens =
                    quantidadeImagens(anuncio);

                  return (
                    <article
                      key={anuncio.id}
                      className="product-card"
                      onClick={() =>
                        navigate(
                          `/anuncios/${anuncio.id}`
                        )
                      }
                      tabIndex={0}
                      role="button"
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          navigate(
                            `/anuncios/${anuncio.id}`
                          );
                        }
                      }}
                      aria-label={`Ver anúncio ${anuncio.titulo}`}
                    >
                      <div className="product-image">
                        {imagemPrincipal ? (
                          <img
                            src={imagemPrincipal}
                            alt={anuncio.titulo}
                            loading="lazy"
                          />
                        ) : (
                          <span aria-hidden="true">
                            📚
                          </span>
                        )}

                        <span
                          className={`product-badge product-badge--${anuncio.modalidade}`}
                        >
                          {obterTextoModalidade(
                            anuncio.modalidade
                          )}
                        </span>

                        {totalImagens > 1 && (
                          <span
                            className="product-image-count"
                            aria-label={`${totalImagens} fotos`}
                          >
                            <span aria-hidden="true">
                              ▧
                            </span>

                            {totalImagens}
                          </span>
                        )}
                      </div>

                      <div className="product-info">
                        <h3>
                          {anuncio.titulo}
                        </h3>

                        <div
                          className="product-meta"
                          aria-label="Informações do item"
                        >
                          <span className="product-category">
                            {anuncio.categoria}
                          </span>

                          <span
                            className={`product-condition product-condition--${
                              anuncio.condicao || "nao-informado"
                            }`}
                          >
                            {obterTextoCondicao(
                              anuncio.condicao
                            )}
                          </span>
                        </div>

                        <p className="product-author">
                          Publicado por{" "}
                          <strong>
                            {anuncio.publicado_por ||
                              "Usuário"}
                          </strong>
                        </p>

                        <div className="product-footer">
                          {anuncio.modalidade ===
                          "venda" ? (
                            <strong>
                              R${" "}
                              {Number(
                                anuncio.preco
                              ).toFixed(2)}
                            </strong>
                          ) : (
                            <strong>
                              {anuncio.modalidade ===
                              "doacao"
                                ? "Gratuito"
                                : "Aceita troca"}
                            </strong>
                          )}

                          <span
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )}
      </section>

      <BottomNavigation />
    </main>
  );
}

export default Anuncios;