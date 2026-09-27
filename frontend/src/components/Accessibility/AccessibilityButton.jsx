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
     ABRIR / FECHAR
  ========================================================== */

  function abrirPainel() {
    setAberto(true);
    setMensagem("");
  }

  function fecharPainel() {
    setAberto(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  }

  function handleTogglePainel() {
    if (aberto) {
      fecharPainel();
      return;
    }

    abrirPainel();
  }


  /* ==========================================================
     FOCO + ESC + CLIQUE FORA
  ========================================================== */

  useEffect(() => {
    if (!aberto) {
      return;
    }

    const painel = painelRef.current;

    if (!painel) {
      return;
    }

    /*
     * Impede que o conteúdo da página continue sendo
     * rolado enquanto o painel estiver aberto.
     */
    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";


    /*
     * Coloca o foco no primeiro controle do painel.
     */
    const animationFrame =
      requestAnimationFrame(() => {
        const primeiroElemento =
          painel.querySelector(
            "button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])"
          );

        primeiroElemento?.focus();
      });


    function obterElementosFocaveis() {
      return Array.from(
        painel.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
        )
      ).filter(
        (element) =>
          !element.hasAttribute("aria-hidden") &&
          element.offsetParent !== null
      );
    }


    function handleKeyDown(event) {

      /* -----------------------------------------------
         ESC
      ------------------------------------------------ */

      if (event.key === "Escape") {
        event.preventDefault();

        fecharPainel();

        return;
      }


      /* -----------------------------------------------
         TAB / SHIFT + TAB
      ------------------------------------------------ */

      if (event.key !== "Tab") {
        return;
      }

      const elementos =
        obterElementosFocaveis();

      if (!elementos.length) {
        event.preventDefault();
        return;
      }

      const primeiro =
        elementos[0];

      const ultimo =
        elementos[elementos.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === primeiro
      ) {
        event.preventDefault();

        ultimo.focus();

        return;
      }

      if (
        !event.shiftKey &&
        document.activeElement === ultimo
      ) {
        event.preventDefault();

        primeiro.focus();
      }
    }


    function handlePointerDown(event) {
      const target = event.target;

      /*
       * Clique dentro do painel:
       * não fecha.
       */
      if (painel.contains(target)) {
        return;
      }

      /*
       * Clique no próprio botão:
       * o onClick do botão é responsável por
       * abrir/fechar.
       */
      if (buttonRef.current?.contains(target)) {
        return;
      }

      /*
       * Qualquer outro lugar da página:
       * fecha o painel.
       */
      fecharPainel();
    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );


    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.body.style.overflow =
        overflowAnterior;
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

    /*
     * Não sobrescreve mensagens como
     * "Leitura interrompida" imediatamente.
     */
    if (
      mensagem === "Leitura em andamento."
    ) {
      setMensagem("");
    }
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

    const started =
      readSelectedText();

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
     ALTERAÇÕES DE ACESSIBILIDADE
  ========================================================== */

  function handleFontSizeChange(size) {
    setFontSize(size);

    const mensagens = {
      normal: "Tamanho do texto definido como normal.",
      large: "Tamanho do texto aumentado.",
      larger: "Tamanho do texto ampliado."
    };

    setMensagem(
      mensagens[size] || ""
    );
  }


  function handleToggleIncreasedSpacing() {
    toggleIncreasedSpacing();

    setMensagem(
      settings.increasedSpacing
        ? "Espaçamento reduzido."
        : "Mais espaçamento ativado."
    );
  }


  function handleToggleReadingFont() {
    toggleReadingFont();

    setMensagem(
      settings.readingFont
        ? "Fonte padrão restaurada."
        : "Fonte para leitura ativada."
    );
  }


  function handleToggleHighContrast() {
    toggleHighContrast();

    setMensagem(
      settings.highContrast
        ? "Alto contraste desativado."
        : "Alto contraste ativado."
    );
  }


  function handleToggleHighlightLinks() {
    toggleHighlightLinks();

    setMensagem(
      settings.highlightLinks
        ? "Destaque de links desativado."
        : "Links destacados."
    );
  }


  function handleToggleLargeCursor() {
    toggleLargeCursor();

    setMensagem(
      settings.largeCursor
        ? "Cursor ampliado desativado."
        : "Cursor ampliado ativado."
    );
  }


  function handleToggleEnhancedFocus() {
    toggleEnhancedFocus();

    setMensagem(
      settings.enhancedFocus
        ? "Foco reforçado desativado."
        : "Foco reforçado ativado."
    );
  }


  function handleToggleReducedMotion() {
    toggleReducedMotion();

    setMensagem(
      settings.reducedMotion
        ? "Redução de movimento desativada."
        : "Redução de movimento ativada."
    );
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
        onClick={handleTogglePainel}
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
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${painelId}-title`}
          aria-describedby={`${painelId}-description`}
        >

          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <div className="accessibility-panel-header">

            <div>
              <h2 id={`${painelId}-title`}>
                Acessibilidade
              </h2>

              <p id={`${painelId}-description`}>
                Personalize sua experiência no
                Conecta Bandeirante.
              </p>
            </div>

            <button
              type="button"
              className="accessibility-close"
              onClick={fecharPainel}
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

          {mensagem && (
            <div
              className="accessibility-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {mensagem}
            </div>
          )}


          {/* ==================================================
              OPÇÕES
          ================================================== */}

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
                      handleFontSizeChange("normal")
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
                      handleFontSizeChange("large")
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
                      handleFontSizeChange("larger")
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
                  onClick={
                    handleToggleIncreasedSpacing
                  }
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
                  onClick={
                    handleToggleReadingFont
                  }
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
                  onClick={
                    handleToggleHighContrast
                  }
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
                  onClick={
                    handleToggleHighlightLinks
                  }
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
                  onClick={
                    handleToggleLargeCursor
                  }
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
                  onClick={
                    handleToggleEnhancedFocus
                  }
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
                  onClick={
                    handleToggleReducedMotion
                  }
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
                  onClick={
                    handleReadSelectedText
                  }
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