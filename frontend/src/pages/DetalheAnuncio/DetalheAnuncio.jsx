import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";

import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";

import api from "../../services/api";

import "./DetalheAnuncio.css";


const CONDICOES = {
  novo: "Novo",
  bom_estado: "Bom estado",
  usado: "Usado",
};


function formatarPreco(
  preco
) {
  if (
    preco === null ||
    preco === undefined
  ) {
    return "";
  }

  return Number(
    preco
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function formatarData(
  data
) {
  const [ano, mes, dia] =
    data.split("-");

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  ).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function obterLabelModalidade(
  modalidade
) {
  if (
    modalidade ===
    "doacao"
  ) {
    return "Doação";
  }

  if (
    modalidade ===
    "troca"
  ) {
    return "Troca";
  }

  return "Venda";
}


function DetalheAnuncio() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    anuncio,
    setAnuncio,
  ] = useState(null);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState("");


  const usuario = JSON.parse(
    localStorage.getItem(
      "usuario"
    )
  );

  const parceiro = JSON.parse(
    localStorage.getItem(
      "parceiro"
    )
  );

  const pessoa =
    usuario || parceiro;


  useEffect(() => {
    if (!pessoa) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }


    carregarAnuncio();
  }, [id]);


  async function carregarAnuncio() {
    setCarregando(
      true
    );

    setErro("");


    try {
      const resposta =
        await api.get(
          `/anuncios/${id}`
        );

      setAnuncio(
        resposta.data
      );

    } catch (error) {
      setErro(
        error.response?.data?.erro ||
          "Não foi possível carregar o anúncio."
      );

    } finally {
      setCarregando(
        false
      );
    }
  }


  function voltar() {
    navigate(
      "/inicio"
    );
  }


  if (carregando) {
    return (
      <main className="detalhe-anuncio-page">

        <MarketplaceNavbar
          pessoa={pessoa}
          tituloPagina="Anúncio"
          aoVoltarPagina={
            voltar
          }
        />

        <div className="detalhe-feedback">
          Carregando anúncio...
        </div>

      </main>
    );
  }


  if (erro || !anuncio) {
    return (
      <main className="detalhe-anuncio-page">

        <MarketplaceNavbar
          pessoa={pessoa}
          tituloPagina="Anúncio"
          aoVoltarPagina={
            voltar
          }
        />

        <div className="detalhe-feedback detalhe-feedback--error">

          <h1>
            Anúncio não encontrado
          </h1>

          <p>
            {erro ||
              "Este anúncio não está disponível."}
          </p>

          <button
            type="button"
            onClick={
              voltar
            }
          >
            Voltar para os anúncios
          </button>

        </div>

      </main>
    );
  }


  const modalidadeLabel =
    obterLabelModalidade(
      anuncio.modalidade
    );


  return (
    <main className="detalhe-anuncio-page">

      <MarketplaceNavbar
        pessoa={pessoa}
        tituloPagina="Anúncio"
        aoVoltarPagina={
          voltar
        }
      />


      <section className="detalhe-anuncio-content">

        <button
          type="button"
          className="detalhe-back-button"
          onClick={
            voltar
          }
        >
          ← Voltar para anúncios
        </button>


        <div className="detalhe-anuncio-grid">

          <section className="detalhe-galeria">

            <ImageCarousel
              imagens={
                anuncio.imagens
              }
              titulo={
                anuncio.titulo
              }
            />

          </section>


          <section className="detalhe-informacoes">

            <span
              className={`detalhe-badge detalhe-badge--${anuncio.modalidade}`}
            >
              {modalidadeLabel}
            </span>


            <span className="detalhe-categoria">
              {anuncio.categoria}
            </span>


            <h1>
              {anuncio.titulo}
            </h1>


            <div className="detalhe-preco">

              {anuncio.modalidade ===
              "venda" ? (
                <strong>
                  {
                    formatarPreco(
                      anuncio.preco
                    )
                  }
                </strong>
              ) : anuncio.modalidade ===
                "doacao" ? (
                <strong>
                  Gratuito
                </strong>
              ) : (
                <strong>
                  Aceita troca
                </strong>
              )}

            </div>


            <div className="detalhe-info-block">

              <h2>
                Sobre o item
              </h2>

              <p>
                {
                  anuncio.descricao
                }
              </p>

            </div>


            <div className="detalhe-info-list">

              <div>
                <span>
                  Condição
                </span>

                <strong>
                  {
                    CONDICOES[
                      anuncio.condicao
                    ] ||
                    anuncio.condicao
                  }
                </strong>
              </div>


              <div>
                <span>
                  Fotos
                </span>

                <strong>
                  {
                    anuncio.imagens
                      ?.length || 0
                  }
                  {
                    anuncio.imagens
                      ?.length === 1
                      ? " foto"
                      : " fotos"
                  }
                </strong>
              </div>

            </div>


            <div className="detalhe-entrega">

              <strong>
                Retirada segura na escola
              </strong>

              <p>
                A entrega ou retirada
                acontece em um espaço
                reservado no La Salle
                Bandeirante.
              </p>

            </div>


            <div className="detalhe-datas">

              <h2>
                Dias disponíveis
              </h2>

              {anuncio.datas?.length >
              0 ? (
                <ul>
                  {anuncio.datas.map(
                    (data) => (
                      <li
                        key={data}
                      >
                        {
                          formatarData(
                            data
                          )
                        }
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  Nenhuma data disponível
                  no momento.
                </p>
              )}

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}


export default DetalheAnuncio;