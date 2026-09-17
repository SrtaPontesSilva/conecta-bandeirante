import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [cupons, setCupons] = useState([]);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  useEffect(() => {
    carregarCupons();
  }, []);

  async function carregarCupons() {
    try {
      const resposta = await api.get("/cupons");

      setCupons(
        Array.isArray(resposta.data) ? resposta.data : []
      );
    } catch (error) {
      setCupons([]);
    }
  }

  function atualizarNavegacao() {
    const elemento = trackRef.current;

    if (!elemento) {
      return;
    }

    setPodeVoltar(elemento.scrollLeft > 4);

    setPodeAvancar(
      elemento.scrollLeft + elemento.clientWidth <
        elemento.scrollWidth - 4
    );
  }

  useEffect(() => {
    atualizarNavegacao();

    const elemento = trackRef.current;

    if (!elemento) {
      return;
    }

    elemento.addEventListener(
      "scroll",
      atualizarNavegacao,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      atualizarNavegacao
    );

    return () => {
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

  function rolar(direcao) {
    const elemento = trackRef.current;

    if (!elemento) {
      return;
    }

    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    elemento.scrollBy({
      left: direcao * elemento.clientWidth * 0.9,
      behavior: reduzMovimento ? "auto" : "smooth",
    });
  }

  function irParaResgates() {
    navigate(ROTA_CUPONS);
  }

  return (
    <section
      className="cupons-section"
      aria-labelledby="cupons-titulo"
    >
      <div className="cupons-header">
        <h2 id="cupons-titulo">
          Cupons de resgate
        </h2>

        <button
          type="button"
          className="cupons-ver-mais"
          onClick={irParaResgates}
        >
          Ver mais
          <IconChevronRight size={16} />
        </button>
      </div>

      <div className="cupons-carousel-wrapper">
        {podeVoltar && (
          <button
            type="button"
            className="cupons-nav cupons-nav--prev"
            onClick={() => rolar(-1)}
            aria-label="Ver cupons anteriores"
          >
            <IconChevronLeft size={18} />
          </button>
        )}

        <div
          className="cupons-track"
          ref={trackRef}
          role="region"
          aria-label="Lista de cupons de resgate"
          tabIndex={0}
        >
          <ul className="cupons-list">
            <li className="cupom-card cupom-card--info">
              <div
                className="cupom-card-icon"
                aria-hidden="true"
              >
                <IconGift size={26} />
              </div>

              <h3>
                Resgate cupons exclusivos
              </h3>

              <p>
                Troque seus pontos por descontos e
                vantagens dentro da comunidade
                Conecta Bandeirante.
              </p>

              <button
                type="button"
                className="cupom-card-cta"
                onClick={irParaResgates}
              >
                Ver cupons disponíveis
                <IconChevronRight size={16} />
              </button>
            </li>

            {cupons.map((cupom) => (
              <li
                key={cupom.id}
                className="cupom-card"
              >
                {cupom.imagem && (
                  <div className="cupom-card-imagem">
                    <img
                      src={cupom.imagem}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                )}

                <h3>{cupom.titulo}</h3>

                {cupom.descricao && (
                  <p>{cupom.descricao}</p>
                )}

                {cupom.validade && (
                  <span className="cupom-card-validade">
                    Válido até {cupom.validade}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {podeAvancar && (
          <button
            type="button"
            className="cupons-nav cupons-nav--next"
            onClick={() => rolar(1)}
            aria-label="Ver mais cupons"
          >
            <IconChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

export default CuponsCarousel;