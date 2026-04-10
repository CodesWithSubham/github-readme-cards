export const MARKER_PREFIX = "GRC";

export function makeStartMarker(id: string) {
  return `<!-- ${MARKER_PREFIX}:${id}:START -->`;
}

export function makeEndMarker(id: string) {
  return `<!-- ${MARKER_PREFIX}:${id}:END -->`;
}

export function verifyMarkers(
  readme: string,
  ids: string[]
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const id of ids) {
    if (!readme.includes(makeStartMarker(id)) || !readme.includes(makeEndMarker(id))) {
      missing.push(id);
    }
  }
  return { ok: missing.length === 0, missing };
}

export const SECTION_DEFS: Record<
  string,
  { label: string; icon: string; apiPath: string; description: string }
> = {
  stats:        { label: "GitHub Stats",      icon: "📊", apiPath: "/stats",        description: "Stars, forks, commits, PRs, issues & rank badge" },
  streak:       { label: "Streak",            icon: "🔥", apiPath: "/streak",       description: "Current streak, longest streak, total contributions" },
  "top-lang":   { label: "Top Languages",     icon: "💻", apiPath: "/top-lang",     description: "Most used programming languages bar chart" },
  achievements: { label: "Achievements",      icon: "🏆", apiPath: "/achievements", description: "Earned GitHub badges" },
};
