// app/api/github-top-langs/route.ts
import { Octokit } from "octokit";

export const revalidate = 600; // cache for 10 minutes

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const username = process.env.GITHUB_USERNAME;

// GraphQL query for top languages
const TOP_LANGUAGES_QUERY = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      repositories(first: 100, isFork: false, ownerAffiliations: OWNER, after: $after) {
        nodes {
          languages(first: 10) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

async function fetchTopLanguages(username: string) {
  let after: string | null = null;
  let done = false;
  const totals: Record<string, { size: number; color: string }> = {};

  while (!done) {
    const res: TopLanguagesResponse = await octokit.graphql<TopLanguagesResponse>(
      TOP_LANGUAGES_QUERY,
      { login: username, after }
    );

    const repos = res.user?.repositories?.nodes ?? [];

    for (const repo of repos) {
      for (const edge of repo.languages?.edges ?? []) {
        const { name, color } = edge.node;
        const size = edge.size ?? 0;
        if (!totals[name]) totals[name] = { size: 0, color: color || "#9e9e9e" };
        totals[name].size += size;
      }
    }

    const pageInfo = res.user?.repositories?.pageInfo;
    if (pageInfo?.hasNextPage) after = pageInfo.endCursor;
    else done = true;
  }

  const totalSize = Object.values(totals).reduce((a, v) => a + v.size, 0);
  return Object.entries(totals)
    .map(([name, { size, color }]) => ({
      name,
      color,
      percent: (size / totalSize) * 100,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);
}

export async function GET() {
  try {
    if (!username) throw new Error("Missing GITHUB_USERNAME");
    if (!process.env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");

    const langs = await fetchTopLanguages(username);
    const width = 300;
    const height = 160;

    // Calculate stacked bar widths
    const totalBarWidth = 250;
    let offsetX = 0;
    const bars = langs
      .map((l) => {
        const w = (l.percent / 100) * totalBarWidth;
        const rect = `<rect mask="url(#rect-mask)" data-testid="lang-progress" x="${offsetX}" y="0" width="${w}" height="8" fill="${l.color}"/>`;
        offsetX += w;
        return rect;
      })
      .join("\n");

    // Split list visually into two columns for names
    const [left, right] = langs.reduce<[typeof langs, typeof langs]>(
      ([l, r], lang, i) => ((i % 2 ? r : l).push(lang), [l, r]),
      [[], []]
    );

    const leftList = left
      .map(
        (l, i) => `
          <g transform="translate(0, ${i * 25})">
            <g class="stagger" style="animation-delay: ${450 + i * 150}ms">
              <circle cx="5" cy="6" r="5" fill="${l.color}"/>
              <text data-testid="lang-name" x="15" y="10" class="lang-name">
                ${l.name} ${l.percent.toFixed(2)}%
              </text>
            </g>
          </g>
        `
      )
      .join("");

    const rightList = right
      .map(
        (l, i) => `
  <g transform="translate(0, ${i * 25})">
    <g class="stagger" style="animation-delay: ${450 + i * 150}ms">
      <circle cx="5" cy="6" r="5" fill="${l.color}"/>
      <text data-testid="lang-name" x="15" y="10" class="lang-name">
        ${l.name} ${l.percent.toFixed(2)}%
      </text>
    </g>
  </g>`
      )
      .join("");

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="descId">
  <title id="titleId">${username}'s Most Used Languages</title>
  <desc id="descId">Top languages used by ${username}</desc>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #a277ff;
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    @supports(-moz-appearance: auto) {
      .header { font-size: 15.5px; }
    }
    @keyframes slideInAnimation { from { width: 0; } to { width: calc(100%-100px); } }
    @keyframes growWidthAnimation { from { width: 0; } to { width: 100%; } }
    .lang-name {
      font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
      fill: #61ffca;
    }
    .stagger { opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards; }
    #rect-mask rect { animation: slideInAnimation 1s ease-in-out forwards; }
    .lang-progress { animation: growWidthAnimation 0.6s ease-in-out forwards; }
    @keyframes fadeInAnimation { from { opacity: 0; } to { opacity: 1; } }
  </style>

  <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" width="299" fill="#15141b" />

  <g data-testid="card-title" transform="translate(25, 35)">
    <text class="header" data-testid="header">Most Used Languages</text>
  </g>

  <g data-testid="main-card-body" transform="translate(0, 55)">
    <svg data-testid="lang-items" x="25">
      <mask id="rect-mask"><rect x="0" y="0" width="${totalBarWidth}" height="8" fill="white" rx="5"/></mask>
      ${bars}
      <g transform="translate(0, 25)">
        <g transform="translate(0, 0)">
          ${leftList}
        </g>
        <g transform="translate(150, 0)">
          ${rightList}
        </g>
      </g>
    </svg>
  </g>
</svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "s-maxage=600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("GET error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="60"><text x="10" y="35" fill="red">Error: ${message}</text></svg>`;
    return new Response(errSvg, { headers: { "Content-Type": "image/svg+xml" } });
  }
}

// --- Type definitions for GraphQL response ---
type TopLanguagesResponse = {
  user: {
    repositories: {
      nodes: {
        languages: {
          edges: {
            size: number;
            node: {
              name: string;
              color?: string | null;
            };
          }[];
        } | null;
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
};
