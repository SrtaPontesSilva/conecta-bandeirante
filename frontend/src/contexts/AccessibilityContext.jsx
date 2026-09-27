import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const AccessibilityContext = createContext(null);

const STORAGE_KEY = "conecta-accessibility";

const DEFAULT_SETTINGS = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
  highlightLinks: false,
  increasedSpacing: false,
  largeCursor: false,
  readingFont: false,
  enhancedFocus: false
};

function getStoredSettings() {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);

    if (!savedSettings) {
      return DEFAULT_SETTINGS;
    }

    const parsedSettings = JSON.parse(savedSettings);

    if (
      !parsedSettings ||
      typeof parsedSettings !== "object" ||
      Array.isArray(parsedSettings)
    ) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(
    getStoredSettings
  );

  const [reading, setReading] = useState(false);

  /* ==========================================================
     PERSISTÊNCIA
  ========================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // O funcionamento da acessibilidade não deve quebrar
      // caso o localStorage esteja indisponível.
    }
  }, [settings]);


  /* ==========================================================
     APLICAÇÃO GLOBAL DAS PREFERÊNCIAS
  ========================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.fontSize = settings.fontSize;

    root.dataset.highContrast = settings.highContrast
      ? "true"
      : "false";

    root.dataset.reducedMotion = settings.reducedMotion
      ? "true"
      : "false";

    root.dataset.highlightLinks = settings.highlightLinks
      ? "true"
      : "false";

    root.dataset.increasedSpacing = settings.increasedSpacing
      ? "true"
      : "false";

    root.dataset.largeCursor = settings.largeCursor
      ? "true"
      : "false";

    root.dataset.readingFont = settings.readingFont
      ? "true"
      : "false";

    root.dataset.enhancedFocus = settings.enhancedFocus
      ? "true"
      : "false";
  }, [settings]);


  /* ==========================================================
     TAMANHO DO TEXTO
  ========================================================== */

  function setFontSize(fontSize) {
    const allowedSizes = [
      "normal",
      "large",
      "larger"
    ];

    if (!allowedSizes.includes(fontSize)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      fontSize
    }));
  }


  /* ==========================================================
     ALTO CONTRASTE
  ========================================================== */

  function toggleHighContrast() {
    setSettings((current) => ({
      ...current,
      highContrast: !current.highContrast
    }));
  }


  /* ==========================================================
     REDUZIR MOVIMENTO
  ========================================================== */

  function toggleReducedMotion() {
    setSettings((current) => ({
      ...current,
      reducedMotion: !current.reducedMotion
    }));
  }


  /* ==========================================================
     DESTACAR LINKS
  ========================================================== */

  function toggleHighlightLinks() {
    setSettings((current) => ({
      ...current,
      highlightLinks: !current.highlightLinks
    }));
  }


  /* ==========================================================
     ESPAÇAMENTO DE TEXTO
  ========================================================== */

  function toggleIncreasedSpacing() {
    setSettings((current) => ({
      ...current,
      increasedSpacing: !current.increasedSpacing
    }));
  }


  /* ==========================================================
     CURSOR AMPLIADO
  ========================================================== */

  function toggleLargeCursor() {
    setSettings((current) => ({
      ...current,
      largeCursor: !current.largeCursor
    }));
  }


  /* ==========================================================
     FONTE PARA LEITURA
  ========================================================== */

  function toggleReadingFont() {
    setSettings((current) => ({
      ...current,
      readingFont: !current.readingFont
    }));
  }


  /* ==========================================================
     FOCO REFORÇADO
  ========================================================== */

  function toggleEnhancedFocus() {
    setSettings((current) => ({
      ...current,
      enhancedFocus: !current.enhancedFocus
    }));
  }


  /* ==========================================================
     LEITURA DE TEXTO
  ========================================================== */

  function stopReading() {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();
    setReading(false);
  }


  function readText(text) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return false;
    }

    const texto = String(text || "").trim();

    if (!texto) {
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(texto);

    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setReading(true);
    };

    utterance.onend = () => {
      setReading(false);
    };

    utterance.onerror = () => {
      setReading(false);
    };

    window.speechSynthesis.speak(utterance);

    return true;
  }


  function readSelectedText() {
    if (
      typeof window === "undefined" ||
      !window.getSelection
    ) {
      return false;
    }

    const selection = window
      .getSelection()
      ?.toString()
      .trim();

    if (!selection) {
      return false;
    }

    return readText(selection);
  }


  /* ==========================================================
     RESTAURAR
  ========================================================== */

  function resetAccessibility() {
    stopReading();

    setSettings({
      ...DEFAULT_SETTINGS
    });
  }


  /* ==========================================================
     LIMPEZA DA LEITURA AO DESMONTAR
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  /* ==========================================================
     CONTEXTO
  ========================================================== */

  const value = useMemo(
    () => ({
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
      readText,
      stopReading,

      resetAccessibility
    }),
    [
      settings,
      reading
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}


function useAccessibility() {
  const context = useContext(
    AccessibilityContext
  );

  if (!context) {
    throw new Error(
      "useAccessibility deve ser usado dentro de AccessibilityProvider."
    );
  }

  return context;
}


export {
  AccessibilityProvider,
  useAccessibility
};