import type { CardColors } from "../themes/types";

export type AchievementBadge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "x";
  count?: string;
  src?: string;
};

const ACHIEVEMENT_COLORS = {
  bronze: "#cd7f32",
  silver: "#9e9e9e",
  gold: "#ffd700",
  x: "#c792ea",
};

export function renderAchievementsCard(
  badges: AchievementBadge[],
  username: string,
  theme: CardColors,
  opts: { border?: boolean } = {},
): string {
  const { border = true } = opts;
  const cols = 4;
  const badgeW = 80;
  const badgeH = 85;
  const rows = Math.ceil(badges.length / cols);
  const width = 380;
  const height = 60 + rows * badgeH;

  const badgeEls = badges
    .map((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * badgeW;
      const y = 50 + row * badgeH;
      const c = ACHIEVEMENT_COLORS[b.tier] || ACHIEVEMENT_COLORS.bronze;

      const countEl =
        b.count && b.count !== "x1"
          ? `<g transform="translate(56, 12)">
             <rect x="-8" y="-6" width="16" height="11" rx="3.5" fill="${c}"/>
             <text text-anchor="middle" y="2.5" font-family="'Segoe UI',sans-serif" font-size="8" font-weight="bold" fill="${theme.bg}">${b.count}</text>
           </g>`
          : "";

      const badgeIcon = b.src
        ? `<image href="${b.src}" x="20" y="8" width="40" height="40"/>`
        : `<text x="40" y="32" text-anchor="middle" font-size="24">${b.emoji}</text>`;

      return `<g transform="translate(${x},${y})" class="stagger" style="animation-delay:${i * 80}ms">
      ${badgeIcon}
      ${countEl}
      <text x="40" y="62" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="9" fill="${theme.secondary}" font-weight="600">${b.name}</text>
    </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img">
  <title>${username}'s Achievements</title>
  <style>
    .header{font:600 16px 'Segoe UI',Ubuntu,sans-serif;fill:${theme.primary};animation:fadeIn 0.8s forwards}
    .stagger{opacity:0;animation:fadeIn 0.4s ease forwards}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  </style>
  <rect x="0.5" y="0.5" rx="6" width="${width - 1}" height="${height - 1}"
    fill="${theme.bg}" stroke="${border ? theme.border : "transparent"}" stroke-opacity="${border ? 1 : 0}"/>
  <text x="20" y="30" class="header">🏆 Achievements</text>
  ${badgeEls}
</svg>`;
}

export function renderAchievementsMarkdown(badges: AchievementBadge[], username: string): string {
  if (!badges.length) return `### 🏆 ${username}'s Achievements\n\n*No achievements unlocked yet.*`;
  const rows = badges
    .map(
      (b) =>
        `| ${b.emoji} **${b.name}** ${b.count && b.count !== "x1" ? `(${b.count})` : ""} | ${b.description} | ${b.tier.toUpperCase()} |`,
    )
    .join("\n");
  return `### 🏆 ${username}'s Achievements

| Badge | Description | Tier |
|-------|-------------|------|
${rows}

*Updated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}*`;
}
