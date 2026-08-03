import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../../components/Logo/Logo";
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

  function handleLogout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("parceiro");

    navigate("/login", { replace: true });
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

  return (
    <main className="anuncios-page">
      <header className="market-header">
        <div className="market-header-inner">
          <button
            type="button"
            className="market-logo"
            onClick={() => navigate("/inicio")}
            aria-label="Ir para o início"
          >
            <Logo />
          </button>

          <button
            type="button"
            className="market-logout"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </header>

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

        <div className="market-search">
          <label
            htmlFor="busca-anuncios"
            className="sr-only"
          >
            Buscar anúncios
          </label>

          <span
            className="market-search-icon"
            aria-hidden="true"
          >
            🔎
          </span>

          <input
            id="busca-anuncios"
            type="search"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="Buscar livros, uniformes, materiais..."
          />

          {busca && (
            <button
              type="button"
              className="market-search-clear"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <nav
          className="market-filters"
          aria-label="Filtrar anúncios"
        >
          <button
            type="button"
            className={
              filtro === "todos"
                ? "market-filter market-filter--active"
                : "market-filter"
            }
            onClick={() => setFiltro("todos")}
          >
            Todos
          </button>

          <button
            type="button"
            className={
              filtro === "doacao"
                ? "market-filter market-filter--active market-filter--donation"
                : "market-filter"
            }
            onClick={() => setFiltro("doacao")}
          >
            Doação
          </button>

          <button
            type="button"
            className={
              filtro === "troca"
                ? "market-filter market-filter--active"
                : "market-filter"
            }
            onClick={() => setFiltro("troca")}
          >
            Troca
          </button>

          <button
            type="button"
            className={
              filtro === "venda"
                ? "market-filter market-filter--active"
                : "market-filter"
            }
            onClick={() => setFiltro("venda")}
          >
            Venda
          </button>
        </nav>

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
                (anuncio) => (
                  <article
                    key={anuncio.id}
                    className="product-card"
                    onClick={() =>
                      navigate(
                        `/anuncios/${anuncio.id}`
                      )
                    }
                  >
                    <div className="product-image">
                      {anuncio.imagem ? (
                        <img
                          src={anuncio.imagem}
                          alt={anuncio.titulo}
                        />
                      ) : (
                        <span aria-hidden="true">
                          📚
                        </span>
                      )}

                      <span
                        className={`product-badge product-badge--${anuncio.modalidade}`}
                      >
                        {anuncio.modalidade ===
                        "doacao"
                          ? "Doação"
                          : anuncio.modalidade ===
                              "troca"
                            ? "Troca"
                            : "Venda"}
                      </span>
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {anuncio.categoria}
                      </span>

                      <h3>
                        {anuncio.titulo}
                      </h3>

                      <p>
                        {anuncio.descricao}
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
                )
              )}
            </section>
          )}
      </section>

      <nav
        className="bottom-navigation"
        aria-label="Navegação principal"
      >

        <button
          type="button"
          className="bottom-navigation-item"
          onClick={() =>
            navigate("/parceiros")
          }
        >
          <span aria-hidden="true">
            🏪
          </span>

          <small>
            Parceiros
          </small>
        </button>

        <button
          type="button"
          className="bottom-navigation-add"
          onClick={() =>
            navigate("/anuncios/novo")
          }
          aria-label="Publicar novo anúncio"
        >
          +
        </button>

        <button
          type="button"
          className="bottom-navigation-item"
          onClick={() =>
            navigate("/perfil")
          }
        >
          <span aria-hidden="true">
            👤
          </span>

          <small>
            Perfil
          </small>
        </button>
      </nav>
    </main>
  );
}

export default Anuncios;
