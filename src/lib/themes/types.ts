import type { darkThemeNames, lightThemeNames, themeNames } from "./themeNames";

export type LightThemeName = (typeof lightThemeNames)[number];
export type DarkThemeName = (typeof darkThemeNames)[number];
export type ThemeName = (typeof themeNames)[number];

export type CardColors = {
  bg: string;
  border: string;
  divider: string;
  primary: string;
  secondary: string;
  accent: string;
  textMuted: string;
  text: string;
  titleColor: string;
  iconColor: string;
  statColor: string;
  ringColor: string;
  fireColor: string;
};
