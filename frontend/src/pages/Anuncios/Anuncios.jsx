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

      <BottomNavigation />
    </main>
  );
}

export default Anuncios;