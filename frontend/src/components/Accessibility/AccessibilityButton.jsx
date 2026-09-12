import { useEffect, useId, useRef, useState } from "react";

import {
  useAccessibility
} from "../../contexts/AccessibilityContext";

import "./Accessibility.css";

function AccessibilityButton() {
  const [aberto, setAberto] = useState(false);

  const painelId = useId();
  const buttonRef = useRef(null);
  const painelRef = useRef(null);

  const {
    settings,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleHighlightLinks,
    resetAccessibility
  } = useAccessibility();

  useEffect(() => {
    if (!aberto) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAberto(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [aberto]);

  function handleReset() {
    resetAccessibility();
  }

  return (
    <div className="accessibility">

      {/* =====================================
          BOTÃO FLUTUANTE
      ====================================== */}

      <button
        ref={buttonRef}
        type="button"
        className="accessibility-button"
        onClick={() => setAberto((current) => !current)}
        aria-label={
          aberto
            ? "Fechar opções de acessibilidade"
            : "Abrir opções de acessibilidade"
        }
        aria-expanded={aberto}
        aria-controls={painelId}
        title="Acessibilidade"
      >
        <span
          className="accessibility-button-icon"
          aria-hidden="true"
        >
          ♿
        </span>
      </button>

      {/* =====================================
          PAINEL
      ====================================== */}

      {aberto && (
        <section
          id={painelId}
          ref={painelRef}
          className="accessibility-panel"
          aria-label="Opções de acessibilidade"
        >

          <div className="accessibility-panel-header">
            <div>
              <h2>Acessibilidade</h2>

              <p>
                Personalize a experiência do site.
              </p>
            </div>

            <button
              type="button"
              className="accessibility-close"
              onClick={() => {
                setAberto(false);
                buttonRef.current?.focus();
              }}
              aria-label="Fechar opções de acessibilidade"
              title="Fechar"
            >
              <span aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <div className="accessibility-options">

            {/* =================================
                TAMANHO DA FONTE
            ================================== */}

            <fieldset className="accessibility-group">

              <legend>
                Tamanho do texto
              </legend>

              <div className="accessibility-button-group">

                <button
                  type="button"
                  className={
                    settings.fontSize === "normal"
                      ? "accessibility-option active"
                      : "accessibility-option"
                  }
                  onClick={() => setFontSize("normal")}
                  aria-pressed={
                    settings.fontSize === "normal"
                  }
                >
                  Normal
                </button>

                <button
                  type="button"
                  className={
                    settings.fontSize === "large"
                      ? "accessibility-option active"
                      : "accessibility-option"
                  }
                  onClick={() => setFontSize("large")}
                  aria-pressed={
                    settings.fontSize === "large"
                  }
                >
                  Grande
                </button>

                <button
                  type="button"
                  className={
                    settings.fontSize === "larger"
                      ? "accessibility-option active"
                      : "accessibility-option"
                  }
                  onClick={() => setFontSize("larger")}
                  aria-pressed={
                    settings.fontSize === "larger"
                  }
                >
                  Maior
                </button>

              </div>

            </fieldset>

            {/* =================================
                ALTO CONTRASTE
            ================================== */}

            <div className="accessibility-setting">

              <div className="accessibility-setting-text">

                <strong>
                  Alto contraste
                </strong>

                <span>
                  Aumenta o contraste entre
                  texto e fundo.
                </span>

              </div>

              <button
                type="button"
                className={
                  settings.highContrast
                    ? "accessibility-toggle active"
                    : "accessibility-toggle"
                }
                onClick={toggleHighContrast}
                aria-pressed={
                  settings.highContrast
                }
                aria-label={`Alto contraste: ${
                  settings.highContrast
                    ? "ativado"
                    : "desativado"
                }`}
              >
                <span aria-hidden="true">
                  {settings.highContrast
                    ? "Ativado"
                    : "Desativado"}
                </span>
              </button>

            </div>

            {/* =================================
                REDUZIR MOVIMENTO
            ================================== */}

            <div className="accessibility-setting">

              <div className="accessibility-setting-text">

                <strong>
                  Reduzir movimento
                </strong>

                <span>
                  Reduz animações e transições.
                </span>

              </div>

              <button
                type="button"
                className={
                  settings.reducedMotion
                    ? "accessibility-toggle active"
                    : "accessibility-toggle"
                }
                onClick={toggleReducedMotion}
                aria-pressed={
                  settings.reducedMotion
                }
                aria-label={`Reduzir movimento: ${
                  settings.reducedMotion
                    ? "ativado"
                    : "desativado"
                }`}
              >
                <span aria-hidden="true">
                  {settings.reducedMotion
                    ? "Ativado"
                    : "Desativado"}
                </span>
              </button>

            </div>

            {/* =================================
                DESTACAR LINKS
            ================================== */}

            <div className="accessibility-setting">

              <div className="accessibility-setting-text">

                <strong>
                  Destacar links
                </strong>

                <span>
                  Destaca visualmente os links
                  da página.
                </span>

              </div>

              <button
                type="button"
                className={
                  settings.highlightLinks
                    ? "accessibility-toggle active"
                    : "accessibility-toggle"
                }
                onClick={toggleHighlightLinks}
                aria-pressed={
                  settings.highlightLinks
                }
                aria-label={`Destacar links: ${
                  settings.highlightLinks
                    ? "ativado"
                    : "desativado"
                }`}
              >
                <span aria-hidden="true">
                  {settings.highlightLinks
                    ? "Ativado"
                    : "Desativado"}
                </span>
              </button>

            </div>

          </div>

          {/* =====================================
              RESTAURAR
          ====================================== */}

          <button
            type="button"
            className="accessibility-reset"
            onClick={handleReset}
          >
            Restaurar configurações
          </button>

        </section>
      )}

    </div>
  );
}

export default AccessibilityButton;