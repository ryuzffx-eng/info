import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { applyThemeVariables } from "@/lib/themeColors";

type ThemeColor = {
  name: string;
  primary: string;
  accent: string;
  neon: string;
};

const themes: Record<string, ThemeColor> = {
  emerald: {
    name: "Emerald Crystal",
    primary: "#10D588",
    accent: "#00E08A",
    neon: "#5BFFC0",
  },
  sky: {
    name: "Sky",
    primary: "oklch(0.75 0.16 230)",
    accent: "oklch(0.65 0.15 240)",
    neon: "oklch(0.82 0.18 220)",
  },
  electric: {
    name: "Electric",
    primary: "oklch(0.6 0.25 260)",
    accent: "oklch(0.5 0.2 270)",
    neon: "oklch(0.75 0.28 255)",
  },
  indigo: {
    name: "Indigo",
    primary: "oklch(0.55 0.2 275)",
    accent: "oklch(0.45 0.18 285)",
    neon: "oklch(0.68 0.22 270)",
  },
  violet: {
    name: "Violet",
    primary: "oklch(0.65 0.22 280)",
    accent: "oklch(0.55 0.2 290)",
    neon: "oklch(0.78 0.23 275)",
  },
  fuchsia: {
    name: "Fuchsia",
    primary: "oklch(0.68 0.24 330)",
    accent: "oklch(0.58 0.22 340)",
    neon: "oklch(0.8 0.25 325)",
  },
  rose: {
    name: "Rose",
    primary: "oklch(0.65 0.24 15)",
    accent: "oklch(0.55 0.22 25)",
    neon: "oklch(0.78 0.25 10)",
  },
  ruby: {
    name: "Ruby",
    primary: "oklch(0.5 0.25 25)",
    accent: "oklch(0.4 0.22 35)",
    neon: "oklch(0.65 0.28 20)",
  },
  crimson: {
    name: "Crimson",
    primary: "oklch(0.55 0.22 25)",
    accent: "oklch(0.45 0.2 35)",
    neon: "oklch(0.68 0.23 20)",
  },
  sunset: {
    name: "Sunset",
    primary: "oklch(0.7 0.2 40)",
    accent: "oklch(0.6 0.18 50)",
    neon: "oklch(0.82 0.22 35)",
  },
  orange: {
    name: "Orange",
    primary: "oklch(0.75 0.18 45)",
    accent: "oklch(0.65 0.17 55)",
    neon: "oklch(0.82 0.2 40)",
  },
  amber: {
    name: "Amber",
    primary: "oklch(0.8 0.18 80)",
    accent: "oklch(0.7 0.17 90)",
    neon: "oklch(0.88 0.19 75)",
  },
  gold: {
    name: "Gold",
    primary: "oklch(0.85 0.15 95)",
    accent: "oklch(0.75 0.14 105)",
    neon: "oklch(0.92 0.16 90)",
  },
  lemon: {
    name: "Lemon",
    primary: "oklch(0.9 0.18 105)",
    accent: "oklch(0.8 0.16 115)",
    neon: "oklch(0.97 0.2 100)",
  },
  lime: {
    name: "Lime",
    primary: "oklch(0.85 0.22 120)",
    accent: "oklch(0.75 0.2 130)",
    neon: "oklch(0.92 0.24 115)",
  },
  mint: {
    name: "Mint",
    primary: "oklch(0.88 0.14 150)",
    accent: "oklch(0.78 0.12 160)",
    neon: "oklch(0.95 0.16 145)",
  },
  teal: {
    name: "Teal",
    primary: "oklch(0.7 0.14 180)",
    accent: "oklch(0.6 0.12 190)",
    neon: "oklch(0.82 0.16 175)",
  },
  forest: {
    name: "Forest",
    primary: "oklch(0.5 0.15 150)",
    accent: "oklch(0.4 0.12 160)",
    neon: "oklch(0.65 0.18 145)",
  },
  slate: {
    name: "Slate",
    primary: "oklch(0.6 0.05 250)",
    accent: "oklch(0.5 0.04 260)",
    neon: "oklch(0.75 0.06 245)",
  },
  coffee: {
    name: "Coffee",
    primary: "oklch(0.55 0.1 60)",
    accent: "oklch(0.45 0.08 70)",
    neon: "oklch(0.7 0.12 55)",
  },
  emergite: {
    name: "Emerite",
    primary: "rgb(0 212 123)",
    accent: "rgb(0 180 100)",
    neon: "rgb(50 255 150)",
  },
  emergiteBlue: {
    name: "Emerite Blue",
    primary: "#3B82F6",
    accent: "#2563EB",
    neon: "#60A5FA",
  },
};

type ThemeContextType = {
  theme: string;
  setTheme: (name: string) => void;
  themes: typeof themes;
  refreshGlobalTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("app-theme");
      // Force emerald: ignore any previously-cached blue theme
      if (stored === "emergiteBlue" || stored === "sky" || stored === "electric") {
        localStorage.setItem("app-theme", "emerald");
        return "emerald";
      }
      return stored || "emerald";
    }
    return "emerald";
  });

  const setTheme = useCallback((name: string) => {
    if (themes[name]) {
      setThemeState(name);
      localStorage.setItem("app-theme", name);
    }
  }, []);

  const refreshGlobalTheme = useCallback(async () => {
    try {
      const data = await api.theme.getGlobal();
      // Ignore blue themes — site is emerald-only
      const blocked = ["emergiteBlue", "sky", "electric"];
      if (data?.theme && themes[data.theme] && !blocked.includes(data.theme)) {
        setThemeState(data.theme);
        localStorage.setItem("app-theme", data.theme);
      }
    } catch (err) {
      console.error("Failed to fetch global theme:", err);
    }
  }, []);

  useEffect(() => {
    refreshGlobalTheme();
  }, [refreshGlobalTheme]);

  // Re-sync when user returns to tab (picks up admin theme changes)
  useEffect(() => {
    const onFocus = () => refreshGlobalTheme();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(refreshGlobalTheme, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [refreshGlobalTheme]);

  useEffect(() => {
    const selectedTheme = themes[theme];
    if (!selectedTheme) return;
    applyThemeVariables(document.documentElement, selectedTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, refreshGlobalTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export { themes };
