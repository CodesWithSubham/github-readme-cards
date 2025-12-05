export type ThemeMode = "light" | "dark";

export type CardColors = {
  bg: string;
  border: string;
  divider: string;

  primary: string;
  secondary: string;
  accent: string;
  textMuted: string;
  text: string;
};

export const colors: Record<ThemeMode, CardColors> = {
  dark: {
    bg: "#15141B",
    border: "#000000",
    divider: "#E4E2E2",

    primary: "#A277FF",     // purple
    secondary: "#61FFCA",   // green
    accent: "#FFCA85",      // yellow
    textMuted: "#9CA3AF",
    text: "#FFFFFF",
  },

  light: {
    bg: "#fcfff1",
    border: "#E5E7EB",
    divider: "#E5E7EB",

    primary: "#5A2DFF",
    secondary: "#0F766E",
    accent: "#D97706",
    textMuted: "#6B7280",
    text: "#111827",
  },
};
