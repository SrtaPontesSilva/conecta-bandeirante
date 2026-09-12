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
  highlightLinks: false
};

function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);

      if (!savedSettings) {
        return DEFAULT_SETTINGS;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(savedSettings)
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

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
  }, [settings]);

  function setFontSize(fontSize) {
    setSettings((current) => ({
      ...current,
      fontSize
    }));
  }

  function toggleHighContrast() {
    setSettings((current) => ({
      ...current,
      highContrast: !current.highContrast
    }));
  }

  function toggleReducedMotion() {
    setSettings((current) => ({
      ...current,
      reducedMotion: !current.reducedMotion
    }));
  }

  function toggleHighlightLinks() {
    setSettings((current) => ({
      ...current,
      highlightLinks: !current.highlightLinks
    }));
  }

  function resetAccessibility() {
    setSettings(DEFAULT_SETTINGS);
  }

  const value = useMemo(
    () => ({
      settings,
      setFontSize,
      toggleHighContrast,
      toggleReducedMotion,
      toggleHighlightLinks,
      resetAccessibility
    }),
    [settings]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

function useAccessibility() {
  const context = useContext(AccessibilityContext);

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