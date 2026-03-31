import { darkThemeNames } from "./themeNames";
import type { CardColors, DarkThemeName, LightThemeName, ThemeName } from "./types";

export const lightThemes: Record<LightThemeName, CardColors> = {
  default: {
    bg: "#fffefe",
    border: "#e4e2e2",
    divider: "#e4e2e2",
    primary: "#2f80ed",
    secondary: "#586069",
    accent: "#f6a623",
    textMuted: "#858585",
    text: "#333",
    titleColor: "#2f80ed",
    iconColor: "#4c71f2",
    statColor: "#333",
    ringColor: "#e4e2e2",
    fireColor: "#FB8C00",
  },
};

export const darkThemes: Record<DarkThemeName, CardColors> = {
  github_dark: {
    bg: "#0d1117",
    border: "#30363d",
    divider: "#30363d",
    primary: "#58a6ff",
    secondary: "#3fb950",
    accent: "#d29922",
    textMuted: "#484f58",
    text: "#c9d1d9",
    titleColor: "#58a6ff",
    iconColor: "#3fb950",
    statColor: "#c9d1d9",
    ringColor: "#58a6ff",
    fireColor: "#f85149",
  },
};

export const themes: Record<ThemeName, CardColors> = {
  ...lightThemes,
  ...darkThemes,
};

export function getTheme(name: ThemeName | undefined) {
  return themes[name ?? "default"] ?? themes.default;
}

export function isDarkTheme(name: ThemeName) {
  return darkThemeNames.some((theme) => theme === name);
}
