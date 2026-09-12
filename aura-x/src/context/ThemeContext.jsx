import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage("animationsEnabled", true);
  const [hasSeenThemePrompt, setHasSeenThemePrompt] = useLocalStorage("hasSeenThemePrompt", false);
  const [showThemePrompt, setShowThemePrompt] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-animations", !animationsEnabled);
  }, [animationsEnabled]);

  useEffect(() => {
    const hour = new Date().getHours();
    const isEvening = hour >= 19 || hour < 5;
    if (!hasSeenThemePrompt && isEvening && theme === "light") {
      const t = setTimeout(() => setShowThemePrompt(true), 900);
      return () => clearTimeout(t);
    }
  }, [hasSeenThemePrompt, theme]);

  const dismissThemePrompt = (accepted) => {
    if (accepted) setTheme("dark");
    setHasSeenThemePrompt(true);
    setShowThemePrompt(false);
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        animationsEnabled,
        setAnimationsEnabled,
        showThemePrompt,
        dismissThemePrompt,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally co-located with its provider
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
