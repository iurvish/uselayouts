"use client";

import * as React from "react";

type Theme = "light" | "dark";

const THEME_KEY = "uselayouts:open-theme";

type OpenThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const OpenThemeContext = React.createContext<OpenThemeContextValue | null>(null);

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const value = window.sessionStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "dark";
  } catch {
    return "dark";
  }
}

function writeTheme(value: Theme) {
  try {
    window.sessionStorage.setItem(THEME_KEY, value);
  } catch {
    // ignore
  }
}

export function OpenThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useLayoutEffect(() => {
    setThemeState(readTheme());
  }, []);

  const setTheme = React.useCallback((value: Theme) => {
    setThemeState(value);
    writeTheme(value);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <OpenThemeContext.Provider value={value}>{children}</OpenThemeContext.Provider>;
}

export function useOpenTheme() {
  const value = React.useContext(OpenThemeContext);
  if (!value) {
    throw new Error("useOpenTheme must be used within OpenThemeProvider");
  }
  return value;
}
