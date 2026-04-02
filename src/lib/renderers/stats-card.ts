import type { CardColors } from "@/lib/themes/types";
import { translate, type Locale } from "../i18n";
import type { StatsData } from "../github/types";

export const statsName = ["stars", "forks", "commits", "prs", "issues", "active"] as const;
type StatKey = (typeof statsName)[number];

type AllStats = {
  key: StatKey;
  label: string;
  value: number;
  icon: string;
};

type StatsCardOptions = {
  icons: boolean;
  border: boolean;
  title: boolean;
  customTitle?: string;
  hiddenStats?: StatKey[];
  locale?: Locale;
  borderRadius?: number;
  lineHeight?: number;
};

export async function renderStatsCard(data: StatsData, theme: CardColors, opts: StatsCardOptions) {
  const {
    icons,
    border,
    title,
    customTitle,
    hiddenStats = [],
    locale = "en",
    borderRadius = 4.5,
    lineHeight = 25,
  } = opts;

  const calcCircleProg = (v: number) => Math.PI * 80 * (1 - Math.min(Math.max(v, 0), 100) / 100);
  const allStats: AllStats[] = [
    {
      key: "stars",
      label: translate(locale, "totalStars"),
      value: data.totalStars,
      icon: "⭐",
    },
    {
      key: "forks",
      label: translate(locale, "totalForks"),
      value: data.totalForks,
      icon: "🍴",
    },
    {
      key: "commits",
      label: translate(locale, "totalCommits"),
      value: data.totalCommits,
      icon: "💬",
    },
    {
      key: "prs",
      label: translate(locale, "totalPRs"),
      value: data.totalPRs,
      icon: "🔀",
    },
    {
      key: "issues",
      label: translate(locale, "totalIssues"),
      value: data.totalIssues,
      icon: "🐛",
    },
    {
      key: "active",
      label: translate(locale, "activeRepos"),
      value: data.activeReposLastYear,
      icon: "📁",
    },
  ];

  const visibleStats = allStats.filter(({ key }) => !hiddenStats.includes(key));

  const width = 440;
  const height = Math.max(210, (title ? 55 : 0) + visibleStats.length * lineHeight);

  const statsRows = visibleStats
    .map(
      (s, i) => `
    <g transform="translate(0, ${i * lineHeight})">
      <g class="stagger" style="animation-delay: ${450 + i * 150}ms" transform="translate(25, 0)">
        ${icons ? `<text class="stat-icon" y="12.5">${s.icon}</text>` : ""}
        <text class="stat bold" x="${icons ? 22 : 0}" y="12.5">${s.label}:</text>
        <text class="stat bold" x="199.01" y="12.5" data-testid="${s.key}">${s.value.toLocaleString()}</text>
      </g>
    </g>`,
    )
    .join("\n");

  const titleText = customTitle || `${data.username}'s ${translate(locale, "stats")}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="titleId">
  <title id="titleId">${titleText}</title>
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.titleColor ?? theme.primary}; animation: fadeIn 0.8s ease-in-out forwards; }
    .stat { font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${theme.statColor ?? theme.secondary}; }
    .stat-icon {  font: 12px monospace; fill: currentColor; }
    .stagger { opacity: 0; animation: fadeIn 0.3s ease-in-out forwards; }
    .rank-text { font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.accent}; animation: scaleIn 0.3s ease-in-out forwards; }
    .rank-circle-rim { stroke: ${theme.textMuted}; fill: none; stroke-width: 6; opacity: 0.2; }
    .rank-circle { stroke: ${theme.secondary}; stroke-dasharray: 250; fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.8; transform-origin: -10px 8px; transform: rotate(-90deg); animation: rankAnim 1s forwards ease-in-out; }
    @keyframes rankAnim { from { stroke-dashoffset: ${calcCircleProg(0)}; } to { stroke-dashoffset: ${calcCircleProg(100 - data.rank.percentile)}; } }
    @keyframes scaleIn { from { transform: translate(-5px, 5px) scale(0); } to { transform: translate(-5px, 5px) scale(1); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .bold { font-weight: 700; }
  </style>

  <rect x="0.5" y="0.5" rx="${borderRadius}" height="99%" width="99%"
    fill="${theme.bg}"
    stroke="${border ? theme.border : "transparent"}"
    stroke-opacity="${border ? 1 : 0}"
  />

  ${
    title
      ? `
  <g data-testid="card-title" transform="translate(25, 35)">
    <text class="header" data-testid="header">${titleText}</text>
  </g>`
      : ""
  }

  <g data-testid="main-card-body" transform="translate(0, ${title ? 55 : 20})">
    <g data-testid="rank-circle" transform="translate(${width - 75}, 47.5)">
      <circle class="rank-circle-rim" cx="-10" cy="8" r="40"/>
      <circle class="rank-circle" cx="-10" cy="8" r="40"/>
      <g class="rank-text">
        <text x="-5" y="3" alignment-baseline="central" dominant-baseline="central" text-anchor="middle">${data.rank.level}</text>
      </g>
    </g>
    <g data-testid="stats">${statsRows}</g>
  </g>
</svg>`;
}


export async function renderStatsMarkdown(
  data: StatsData,
  opts: { locale?: Locale } = {},
): Promise<string> {
  "use cache";

  const { locale = "en" } = opts;
  return `## ${data.username}'s GitHub Stats

| Metric | Count |
|--------|-------|
| ⭐ ${translate(locale, "totalStars")} | ${data.totalStars.toLocaleString()} |
| 🍴 ${translate(locale, "totalForks")} | ${data.totalForks.toLocaleString()} |
| 💬 ${translate(locale, "totalCommits")} | ${data.totalCommits.toLocaleString()} |
| 🔀 ${translate(locale, "totalPRs")} | ${data.totalPRs.toLocaleString()} |
| 🐛 ${translate(locale, "totalIssues")} | ${data.totalIssues.toLocaleString()} |
| 📁 ${translate(locale, "activeRepos")} | ${data.activeReposLastYear.toLocaleString()} |
| 🏆 Rank | ${data.rank.level} (${data.rank.percentile.toFixed(1)}%) |

*Last updated: ${new Date(data.fetchedAt).toLocaleDateString()}*`;
}

export async function renderStatsAscii(data: StatsData): Promise<string> {
  "use cache";

  const line = "─".repeat(40);
  return `╭${line}╮
│  🐙 ${data.username.padEnd(35)}│
├${line}┤
│  ⭐ Stars:    ${String(data.totalStars).padEnd(25)}│
│  🍴 Forks:    ${String(data.totalForks).padEnd(25)}│
│  💬 Commits:  ${String(data.totalCommits).padEnd(25)}│
│  🔀 PRs:      ${String(data.totalPRs).padEnd(25)}│
│  🐛 Issues:   ${String(data.totalIssues).padEnd(25)}│
│  🏆 Rank:     ${data.rank.level.padEnd(25)}│
╰${line}╯`;
}