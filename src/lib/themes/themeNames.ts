export const lightThemeNames = ["default"] as const;

export const darkThemeNames = ["github_dark"] as const;

export const themeNames = [...lightThemeNames, ...darkThemeNames] as const;
