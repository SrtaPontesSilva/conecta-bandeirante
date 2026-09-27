import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";

import {
  useAccessibility
} from "../../contexts/AccessibilityContext";

import "./Accessibility.css";

function AccessibilityButton() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const painelId = useId();

  const buttonRef = useRef(null);
  const painelRef = useRef(null);

  const {
    settings,
    reading,

    setFontSize,

    toggleHighContrast,
    toggleReducedMotion,
    toggleHighlightLinks,
    toggleIncreasedSpacing,
    toggleLargeCursor,
    toggleReadingFont,
    toggleEnhancedFocus,

    readSelectedText,
    stopReading,

    resetAccessibility
  } = useAccessibility();


  /* ==========================================================
     ESC + FOCO
  ========================================================== */

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


  /* ==========================================================
     MENSAGEM DA LEITURA
  ========================================================== */

  useEffect(() => {
    if (reading) {
      setMensagem(
        "Leitura em andamento."
      );

      return;
    }

    setMensagem("");
  }, [reading]);


  /* ==========================================================
     LEITURA
  ========================================================== */

  function handleReadSelectedText() {
    if (reading) {
      stopReading();

      setMensagem(
        "Leitura interrompida."
      );

      return;
    }

    const started = readSelectedText();

    if (!started) {
      setMensagem(
        "Selecione um texto na página para iniciar a leitura."
      );

      return;
    }

    setMensagem(
      "Leitura iniciada."
    );
  }


  /* ==========================================================
     RESTAURAR
  ========================================================== */

  function handleReset() {
    resetAccessibility();

    setMensagem(
      "Configurações restauradas."
    );
  }


  /* ==========================================================
     FECHAR
  ========================================================== */

  function handleClose() {
    setAberto(false);
    buttonRef.current?.focus();
  }


  return (
    <div className="accessibility">

      {/* ====================================================
          BOTÃO FLUTUANTE
      ===================================================== */}

      <button
        ref={buttonRef}
        type="button"
        className="accessibility-button"
        onClick={() => {
          setAberto((current) => !current);
          setMensagem("");
        }}
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

        <span className="accessibility-button-label">
          Acessibilidade
        </span>
      </button>


      {/* ====================================================
          PAINEL
      ===================================================== */}

      {aberto && (
        <section
          id={painelId}
          ref={painelRef}
          className="accessibility-panel"
          aria-labelledby={`${painelId}-title`}
        >

          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <div className="accessibility-panel-header">

            <div>
              <h2 id={`${painelId}-title`}>
                Acessibilidade
              </h2>

              <p>
                Personalize sua experiência no
                Conecta Bandeirante.
              </p>
            </div>

            <button
              type="button"
              className="accessibility-close"
              onClick={handleClose}
              aria-label="Fechar opções de acessibilidade"
              title="Fechar"
            >
              <span aria-hidden="true">
                ×
              </span>
            </button>

          </div>


          {/* ==================================================
              STATUS
          ================================================== */}

          <div
            className="accessibility-status"
            role="status"
            aria-live="polite"
          >
            {mensagem}
          </div>


          <div className="accessibility-options">

            {/* ================================================
                TEXTO
            ================================================= */}

            <div className="accessibility-section">

              <h3>
                Texto
              </h3>


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
                    onClick={() =>
                      setFontSize("normal")
                    }
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
                    onClick={() =>
                      setFontSize("large")
                    }
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
                    onClick={() =>
                      setFontSize("larger")
                    }
                    aria-pressed={
                      settings.fontSize === "larger"
                    }
                  >
                    Maior
                  </button>

                </div>

              </fieldset>


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Mais espaçamento
                  </strong>

                  <span>
                    Aumenta o espaço entre linhas,
                    letras e palavras.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.increasedSpacing
                      ? "accessibility-toggle active"
                      : "accessibility-toggle"
                  }
                  onClick={toggleIncreasedSpacing}
                  aria-pressed={
                    settings.increasedSpacing
                  }
                  aria-label={`Mais espaçamento: ${
                    settings.increasedSpacing
                      ? "ativado"
                      : "desativado"
                  }`}
                >
                  <span aria-hidden="true">
                    {settings.increasedSpacing
                      ? "Ativado"
                      : "Desativado"}
                  </span>
                </button>

              </div>


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Fonte para leitura
                  </strong>

                  <span>
                    Usa uma fonte simples e
                    mais espaçada para leitura.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.readingFont
                      ? "accessibility-toggle active"
                      : "accessibility-toggle"
                  }
                  onClick={toggleReadingFont}
                  aria-pressed={
                    settings.readingFont
                  }
                  aria-label={`Fonte para leitura: ${
                    settings.readingFont
                      ? "ativada"
                      : "desativada"
                  }`}
                >
                  <span aria-hidden="true">
                    {settings.readingFont
                      ? "Ativada"
                      : "Desativada"}
                  </span>
                </button>

              </div>

            </div>


            {/* ================================================
                VISUAL
            ================================================= */}

            <div className="accessibility-section">

              <h3>
                Visual
              </h3>


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Alto contraste
                  </strong>

                  <span>
                    Aumenta a diferença entre
                    texto, fundo e elementos.
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


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Destacar links
                  </strong>

                  <span>
                    Adiciona destaque visual aos
                    links da página.
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


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Cursor ampliado
                  </strong>

                  <span>
                    Aumenta o tamanho do cursor
                    para facilitar sua localização.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.largeCursor
                      ? "accessibility-toggle active"
                      : "accessibility-toggle"
                  }
                  onClick={toggleLargeCursor}
                  aria-pressed={
                    settings.largeCursor
                  }
                  aria-label={`Cursor ampliado: ${
                    settings.largeCursor
                      ? "ativado"
                      : "desativado"
                  }`}
                >
                  <span aria-hidden="true">
                    {settings.largeCursor
                      ? "Ativado"
                      : "Desativado"}
                  </span>
                </button>

              </div>


              <div className="accessibility-setting">

                <div className="accessibility-setting-text">
                  <strong>
                    Foco reforçado
                  </strong>

                  <span>
                    Torna o foco do teclado mais
                    visível durante a navegação.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.enhancedFocus
                      ? "accessibility-toggle active"
                      : "accessibility-toggle"
                  }
                  onClick={toggleEnhancedFocus}
                  aria-pressed={
                    settings.enhancedFocus
                  }
                  aria-label={`Foco reforçado: ${
                    settings.enhancedFocus
                      ? "ativado"
                      : "desativado"
                  }`}
                >
                  <span aria-hidden="true">
                    {settings.enhancedFocus
                      ? "Ativado"
                      : "Desativado"}
                  </span>
                </button>

              </div>

            </div>


            {/* ================================================
                MOVIMENTO E LEITURA
            ================================================= */}

            <div className="accessibility-section">

              <h3>
                Movimento e leitura
              </h3>


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


              <div className="accessibility-reading">

                <div className="accessibility-reading-text">

                  <strong>
                    Leitura de texto
                  </strong>

                  <span>
                    Selecione um texto na página
                    e use este botão para ouvi-lo.
                  </span>

                </div>

                <button
                  type="button"
                  className="accessibility-read-button"
                  onClick={handleReadSelectedText}
                >
                  {reading
                    ? "Parar leitura"
                    : "Ler texto selecionado"}
                </button>

              </div>

            </div>

          </div>


          {/* ==================================================
              RESTAURAR
          ================================================== */}

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