import type { CardColors } from "../themes/types";
import { translate, type Locale } from "../i18n";
import type { StreakStats } from "../github/types";

export async function renderStreakCard(
  stats: StreakStats,
  theme: CardColors,
  opts: { border?: boolean; locale?: Locale } = {},
): Promise<string> {
  const { border = true } = opts;

  const totalContributionsText = translate(opts.locale, "totalContributions");
  const currentStreakText = translate(opts.locale, "currentStreak");
  const longestStreakText = translate(opts.locale, "longestStreak");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation: isolate" viewBox="0 0 495 195" width="495px" height="195px">
  <style>
    @keyframes currstreak { 0% { font-size: 3px; opacity: 0.2; } 80% { font-size: 34px; opacity: 1; } 100% { font-size: 28px; opacity: 1; } }
    @keyframes fadein { 0% { opacity: 0; } 100% { opacity: 1; } }
  </style>
  <defs>
    <clipPath id="outer_rectangle"><rect width="495" height="195" rx="4.5"/></clipPath>
    <mask id="mask_out_ring_behind_fire">
      <rect width="495" height="195" fill="white"/>
      <ellipse cx="247.5" cy="32" rx="13" ry="18" fill="black"/>
    </mask>
  </defs>
  <g clip-path="url(#outer_rectangle)">
    <rect stroke="${border ? theme.border : "transparent"}" fill="${theme.bg}" rx="10" x="0.5" y="0.5" width="494" height="194"/>
    <g>
      <line x1="165" y1="28" x2="165" y2="170" stroke-width="1" stroke="${theme.divider}"/>
      <line x1="330" y1="28" x2="330" y2="170" stroke-width="1" stroke="${theme.divider}"/>
    </g>

    <!-- Total Contributions -->
    <g>
      <text 
        x="82.5" y="80" text-anchor="middle" fill="${theme.primary}"
        font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" 
        font-size="28px" style="opacity:0;animation:fadein 0.5s linear forwards 0.6s"
      >
        ${stats.totalContributions.toLocaleString()}
      </text>
      <text x="82.5" y="116" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 0.7s">${totalContributionsText}</text>
      <text x="82.5" y="146" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 0.8s">${stats.totalRange}</text>
    </g>

    <!-- Current Streak -->
    <g>
      <text x="247.5" y="80" text-anchor="middle" fill="${theme.accent}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="animation:currstreak 0.6s linear forwards">${stats.currentStreak}</text>
      <text x="247.5" y="140" text-anchor="middle" fill="${theme.accent}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 0.9s">${currentStreakText}</text>
      <text x="247.5" y="166" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 0.9s">${stats.currentStreakStart} - ${stats.currentStreakEnd}</text>
      <g mask="url(#mask_out_ring_behind_fire)">
        <circle cx="247.5" cy="71" r="40" fill="none" stroke="${theme.primary}" stroke-width="5" style="opacity:0;animation:fadein 0.5s linear forwards 0.4s"/>
      </g>
      <g transform="translate(247.5, 19.5)" style="opacity:0;animation:fadein 0.5s linear forwards 0.6s">
        <path d="M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z" fill="none"/>
        <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${theme.fireColor ?? theme.primary}"/>
      </g>
    </g>

    <!-- Longest Streak -->
    <g>
      <text x="412.5" y="80" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="opacity:0;animation:fadein 0.5s linear forwards 1.2s">${stats.longestStreak}</text>
      <text x="412.5" y="116" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 1.3s">${longestStreakText}</text>
      <text x="412.5" y="146" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 1.4s">${stats.longestStreakStart} - ${stats.longestStreakEnd}</text>
    </g>
  </g>
</svg>`;
}

export async function renderStreakMarkdown(stats: StreakStats): Promise<string> {
  return `## 🔥 Streak

|  | Count | Range |
|--|-------|-------|
| 🔥 Current Streak | **${stats.currentStreak} days** | ${stats.currentStreakStart} - ${stats.currentStreakEnd} |
| ⚡ Longest Streak | **${stats.longestStreak} days** | ${stats.longestStreakStart} - ${stats.longestStreakEnd} |
| 📊 Total Contributions | **${stats.totalContributions.toLocaleString()}** | ${stats.totalRange} |

*Last updated: ${new Date(stats.fetchedAt).toLocaleDateString()}*`;
}
