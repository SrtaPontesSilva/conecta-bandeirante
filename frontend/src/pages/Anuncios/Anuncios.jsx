import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation.jsx";
import api from "../../services/api";

import "./Anuncios.css";

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

  function anuncioVisivel(anuncio) {
    const termo = busca.trim().toLowerCase();

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

        <div className="market-results-header">
          <h2>
            {filtro === "todos"
              ? "Itens disponíveis"
              : filtro === "doacao"
                ? "Itens para doação"
                : filtro === "troca"
                  ? "Itens para troca"
                  : "Itens à venda"}
          </h2>

          {!carregando && (
            <span>
              {anunciosFiltrados.length}{" "}
              {anunciosFiltrados.length === 1
                ? "item"
                : "itens"}
            </span>
          )}
        </div>

        {carregando && (
          <div className="market-feedback">
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
                Nenhum item encontrado
              </h2>

              <p>
                Tente mudar sua busca ou selecionar
                outra categoria.
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
