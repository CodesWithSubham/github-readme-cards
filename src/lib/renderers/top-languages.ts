import { ENV } from "../env";
import type { TopLanguagesData } from "../github/types";
import { translate, type Locale } from "../i18n";
import type { CardColors } from "../themes/types";

type RenderTopLangsCardOptions = {
  border: boolean;
  locale: Locale;
};

const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;

export async function renderTopLangsCard(
  langs: TopLanguagesData[],
  theme: CardColors,
  opts: RenderTopLangsCardOptions,
): Promise<string> {
  const { border, locale } = opts;
  const width = 300;
  const height = 160;

  // Calculate stacked bar widths
  const totalBarWidth = 250;
  let offsetX = 0;
  const bars = langs
    .map((l) => {
      const w = (l.percent / 100) * totalBarWidth;

      const rect = `<rect data-testid="lang-progress" 
        x="${offsetX}" y="0" width="${w}" height="8" fill="${l.color}"
      />`;

      offsetX += w;
      return rect;
    })
    .join("\n");

  const [left, right] = langs.reduce<[TopLanguagesData[], TopLanguagesData[]]>(
    ([l, r], lang, i) => ((i % 2 ? r : l).push(lang), [l, r]),
    [[], []],
  );

  const renderList = (items: TopLanguagesData[], delay = 0) =>
    items
      .map(
        (l, i) => `
    <g transform="translate(0, ${i * 25})">
      <g class="stagger" style="animation-delay: ${delay + i * 150}ms">
        <circle cx="5" cy="6" r="5" fill="${l.color}"/>
        <text x="15" y="10" class="lang-name">${l.name} ${l.percent.toFixed(2)}%</text>
      </g>
    </g>`,
      )
      .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="titleId">
  <title id="titleId">${username}'s ${translate(locale, "mostUsedLanguages")}</title>
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.titleColor ?? theme.primary}; animation: fadeIn 0.8s ease-in-out forwards; }
    @keyframes slideIn { from { width: 0; } to { width: ${totalBarWidth}px; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .lang-name { font: 400 11px "Segoe UI", Ubuntu, Sans-Serif; fill: ${theme.secondary}; }
    .stagger { opacity: 0; animation: fadeIn 0.3s ease-in-out forwards; }
    #rect-clip rect { animation: slideIn 1s ease-in-out forwards; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="99%" width="299"
    fill="${theme.bg}"
    stroke="${border ? theme.border : "transparent"}"
    stroke-opacity="${border ? 1 : 0}"
  />
  <g transform="translate(25, 35)">
    <text class="header">${translate(locale, "topLanguages")}</text>
  </g>
  <g transform="translate(25, 55)">
    <defs>
      <clipPath id="rect-clip">
        <rect x="0" y="0" width="${totalBarWidth}" height="8" rx="5" />
      </clipPath>
    </defs>

    <!-- Background bar for better contrast -->
    <rect x="0" y="0" width="${totalBarWidth}" height="8" fill="${theme.textMuted}" rx="5" opacity="0.2"/>

    <g clip-path="url(#rect-clip)">${bars}</g>

    <g transform="translate(0, 25)">
      <g transform="translate(0, 0)">${renderList(left, 450)}</g>
      <g transform="translate(150, 0)">${renderList(right, 600)}</g>
    </g>
  </g>
</svg>`;
}

export function renderTopLangsMarkdown(langs: TopLanguagesData[], locale: Locale): string {
  const rows = langs
    .map(
      (l) => `| ${l.name} | ${"█".repeat(Math.round(l.percent / 5))} | ${l.percent.toFixed(2)}% |`,
    )
    .join("\n");

  return `## 💻 ${username}'s ${translate(locale, "mostUsedLanguages")}

| Language | Distribution | Percentage |
|----------|-------------|------------|
${rows}

*Last updated: ${new Date().toLocaleDateString()}*`;
}
