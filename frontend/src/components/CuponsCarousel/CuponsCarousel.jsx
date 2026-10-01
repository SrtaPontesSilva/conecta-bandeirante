import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";

import {
  IconGift,
  IconChevronLeft,
  IconChevronRight,
} from "../Icons/Icons.jsx";

import "./CuponsCarousel.css";


const ROTA_CUPONS = "/resgates";


function CuponsCarousel() {

  const navigate = useNavigate();

  const trackRef = useRef(null);


  /* ============================================================
     ESTADOS
  ============================================================ */

  const [cupons, setCupons] = useState([]);

  const [carregando, setCarregando] =
    useState(true);

  const [podeVoltar, setPodeVoltar] =
    useState(false);

  const [podeAvancar, setPodeAvancar] =
    useState(false);


  /* ============================================================
     BUSCAR CUPONS PÚBLICOS
  ============================================================ */

  useEffect(() => {

    let ativo = true;

    async function carregarCupons() {

      setCarregando(true);

      try {

        const resposta = await api.get(
          "/cupons/publicos"
        );


        /*
         * O backend retorna:
         *
         * {
         *   "cupons": [...]
         * }
         *
         * Portanto precisamos acessar
         * resposta.data.cupons.
         */

        const lista = Array.isArray(
          resposta.data?.cupons
        )
          ? resposta.data.cupons
          : [];


        if (ativo) {

          setCupons(lista);

        }

      } catch (error) {

        console.error(
          "Erro ao carregar cupons públicos:",
          error
        );


        if (ativo) {

          setCupons([]);

        }

      } finally {

        if (ativo) {

          setCarregando(false);

        }

      }

    }


    carregarCupons();


    return () => {

      ativo = false;

    };

  }, []);


  /* ============================================================
     ATUALIZAR NAVEGAÇÃO DO CARROSSEL
  ============================================================ */

  function atualizarNavegacao() {

    const elemento =
      trackRef.current;


    if (!elemento) {

      return;

    }


    const possuiOverflow =
      elemento.scrollWidth >
      elemento.clientWidth + 4;


    setPodeVoltar(
      elemento.scrollLeft > 4
    );


    setPodeAvancar(
      possuiOverflow &&
      elemento.scrollLeft +
        elemento.clientWidth <
        elemento.scrollWidth - 4
    );

  }


  /* ============================================================
     EVENTOS DO CARROSSEL
  ============================================================ */

  useEffect(() => {

    const elemento =
      trackRef.current;


    if (!elemento) {

      return;

    }


    /*
     * Pequeno atraso para garantir que
     * os cards já tenham sido renderizados.
     */

    const frame =
      requestAnimationFrame(
        atualizarNavegacao
      );


    elemento.addEventListener(
      "scroll",
      atualizarNavegacao,
      {
        passive: true,
      }
    );


    window.addEventListener(
      "resize",
      atualizarNavegacao
    );


    return () => {

      cancelAnimationFrame(frame);


      elemento.removeEventListener(
        "scroll",
        atualizarNavegacao
      );


      window.removeEventListener(
        "resize",
        atualizarNavegacao
      );

    };

  }, [cupons]);


  /* ============================================================
     ROLAR CARROSSEL
  ============================================================ */

  function rolar(direcao) {

    const elemento =
      trackRef.current;


    if (!elemento) {

      return;

    }


    const reduzMovimento =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    elemento.scrollBy({

      left:
        direcao *
        elemento.clientWidth *
        0.85,

      behavior:
        reduzMovimento
          ? "auto"
          : "smooth",

    });

  }


  /* ============================================================
     IR PARA RESGATES
  ============================================================ */

  function irParaResgates() {

    navigate(
      ROTA_CUPONS
    );

  }


  /* ============================================================
     FORMATAR DATA
  ============================================================ */

  function formatarData(data) {

    if (!data) {

      return null;

    }


    const dataObjeto =
      new Date(data);


    if (
      Number.isNaN(
        dataObjeto.getTime()
      )
    ) {

      return null;

    }


    return dataObjeto.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      className="cupons-section"
      aria-labelledby="cupons-titulo"
    >

      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <div className="cupons-header">

        <div className="cupons-header__text">

          <span className="cupons-eyebrow">
            BENEFÍCIOS
          </span>

          <h2 id="cupons-titulo">
            Cupons de resgate
          </h2>

          <p>
            Troque seus pontos por descontos
            e benefícios oferecidos pela
            comunidade.
          </p>

        </div>


        <button
          type="button"
          className="cupons-ver-mais"
          onClick={irParaResgates}
        >

          Ver mais

          <IconChevronRight
            size={17}
            aria-hidden="true"
          />

        </button>

      </div>


      {/* ======================================================
          CARREGANDO
      ====================================================== */}

      {carregando && (

        <div
          className="cupons-estado"
          role="status"
          aria-live="polite"
        >

          <div
            className="cupons-estado__icon"
            aria-hidden="true"
          >
            <IconGift size={24} />
          </div>

          <div>

            <strong>
              Carregando benefícios...
            </strong>

            <p>
              Buscando os cupons disponíveis
              para a comunidade.
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          SEM CUPONS
      ====================================================== */}

      {!carregando &&
        cupons.length === 0 && (

          <div
            className="cupons-estado"
          >

            <div
              className="cupons-estado__icon"
              aria-hidden="true"
            >
              <IconGift size={24} />
            </div>

            <div>

              <strong>
                Nenhum benefício disponível ainda
              </strong>

              <p>
                Novos cupons aparecerão aqui
                quando os parceiros da comunidade
                publicarem benefícios.
              </p>

            </div>

          </div>

        )}


      {/* ======================================================
          CARROSSEL
      ====================================================== */}

      {!carregando &&
        cupons.length > 0 && (

          <div className="cupons-carousel-wrapper">

            {podeVoltar && (

              <button
                type="button"
                className="
                  cupons-nav
                  cupons-nav--prev
                "
                onClick={() =>
                  rolar(-1)
                }
                aria-label="Ver cupons anteriores"
              >

                <IconChevronLeft
                  size={19}
                  aria-hidden="true"
                />

              </button>

            )}


            <div
              className="cupons-track"
              ref={trackRef}
              role="region"
              aria-label="Cupons de resgate disponíveis"
              tabIndex={0}
            >

              <ul className="cupons-list">

                {cupons.map(
                  (cupom) => {

                    const dataFim =
                      formatarData(
                        cupom.validade_fim
                      );


                    return (
                      <li
                        key={cupom.id}
                        className="cupom-card"
                      >

                        {/* IMAGEM */}

                        {cupom.imagem_url ? (

                          <div
                            className="
                              cupom-card-imagem
                            "
                          >

                            <img
                              src={
                                cupom.imagem_url
                              }
                              alt=""
                              loading="lazy"
                            />

                          </div>

                        ) : (

                          <div
                            className="
                              cupom-card-imagem
                              cupom-card-imagem--sem-imagem
                            "
                            aria-hidden="true"
                          >

                            <IconGift
                              size={30}
                            />

                          </div>

                        )}


                        {/* CONTEÚDO */}

                        <div
                          className="
                            cupom-card-conteudo
                          "
                        >

                          <span
                            className="
                              cupom-card-categoria
                            "
                          >
                            {cupom.categoria}
                          </span>


                          <h3>
                            {cupom.titulo}
                          </h3>


                          {cupom.descricao && (

                            <p>
                              {cupom.descricao}
                            </p>

                          )}


                          <div
                            className="
                              cupom-card-meta
                            "
                          >

                            <strong>
                              {cupom.pontos}{" "}
                              {cupom.pontos === 1
                                ? "ponto"
                                : "pontos"}
                            </strong>


                            {dataFim && (

                              <span>
                                Até {dataFim}
                              </span>

                            )}

                          </div>

                        </div>

                      </li>
                    );

                  }
                )}

              </ul>

            </div>


            {podeAvancar && (

              <button
                type="button"
                className="
                  cupons-nav
                  cupons-nav--next
                "
                onClick={() =>
                  rolar(1)
                }
                aria-label="Ver mais cupons"
              >

                <IconChevronRight
                  size={19}
                  aria-hidden="true"
                />

              </button>

            )}

          </div>

        )}


      {/* ======================================================
          LINK PARA TODOS OS CUPONS
      ====================================================== */}

      {!carregando &&
        cupons.length > 0 && (

          <div className="cupons-footer">

            <button
              type="button"
              onClick={
                irParaResgates
              }
            >

              Ver todos os cupons

              <IconChevronRight
                size={16}
                aria-hidden="true"
              />

            </button>

          </div>

        )}

    </section>
  );
}


export default CuponsCarousel;