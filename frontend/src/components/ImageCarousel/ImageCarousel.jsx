import { useEffect, useState } from "react";

import {
  IconChevronLeft,
  IconChevronRight,
} from "../Icons/Icons";

import "./ImageCarousel.css";

function normalizarImagem(imagem) {
  if (!imagem) {
    return null;
  }

  if (typeof imagem === "string") {
    return {
      id: null,
      url: imagem,
    };
  }

  return {
    id: imagem.id ?? null,
    url: imagem.url ?? null,
  };
}

function ImageCarousel({
  imagens = [],
  titulo = "Imagem do anúncio",
}) {
  const imagensNormalizadas =
    imagens
      .map(normalizarImagem)
      .filter((imagem) => imagem?.url);

  const [
    indiceAtual,
    setIndiceAtual,
  ] = useState(0);

  useEffect(() => {
    setIndiceAtual(0);
  }, [imagens.length]);

  if (
    imagensNormalizadas.length === 0
  ) {
    return (
      <div
        className="image-carousel image-carousel--empty"
        aria-label="Nenhuma imagem disponível"
      >
        <span
          aria-hidden="true"
        >
          📚
        </span>

        <p>
          Nenhuma foto disponível
        </p>
      </div>
    );
  }

  const total =
    imagensNormalizadas.length;

  const imagemAtual =
    imagensNormalizadas[indiceAtual];

  function irParaAnterior() {
    setIndiceAtual(
      (indice) =>
        indice === 0
          ? total - 1
          : indice - 1
    );
  }

  function irParaProxima() {
    setIndiceAtual(
      (indice) =>
        indice === total - 1
          ? 0
          : indice + 1
    );
  }

  function selecionarImagem(indice) {
    setIndiceAtual(indice);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();

      irParaAnterior();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      irParaProxima();
    }
  }

  return (
    <div
      className="image-carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Galeria de ${total} ${
        total === 1 ? "imagem" : "imagens"
      }`}
    >
      <div className="image-carousel-main">
        <img
          src={imagemAtual.url}
          alt={`${titulo} — foto ${
            indiceAtual + 1
          } de ${total}`}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className="image-carousel-button image-carousel-button--previous"
              onClick={irParaAnterior}
              aria-label="Imagem anterior"
            >
              <IconChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="image-carousel-button image-carousel-button--next"
              onClick={irParaProxima}
              aria-label="Próxima imagem"
            >
              <IconChevronRight size={22} />
            </button>

            <span
              className="image-carousel-counter"
              aria-live="polite"
            >
              {indiceAtual + 1}/{total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div
          className="image-carousel-thumbnails"
          aria-label="Selecionar imagem"
        >
          {imagensNormalizadas.map(
            (imagem, indice) => (
              <button
                key={
                  imagem.id ??
                  `${imagem.url}-${indice}`
                }
                type="button"
                className={
                  indice === indiceAtual
                    ? "image-carousel-thumbnail image-carousel-thumbnail--active"
                    : "image-carousel-thumbnail"
                }
                onClick={() =>
                  selecionarImagem(
                    indice
                  )
                }
                aria-label={`Ver foto ${
                  indice + 1
                } de ${total}`}
                aria-current={
                  indice ===
                  indiceAtual
                    ? "true"
                    : undefined
                }
              >
                <img
                  src={imagem.url}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            )
          )}
        </div>
      )}

      {total > 1 && (
        <div
          className="image-carousel-dots"
          aria-hidden="true"
        >
          {imagensNormalizadas.map(
            (_, indice) => (
              <span
                key={indice}
                className={
                  indice === indiceAtual
                    ? "image-carousel-dot image-carousel-dot--active"
                    : "image-carousel-dot"
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;