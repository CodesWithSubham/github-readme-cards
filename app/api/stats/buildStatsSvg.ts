// app/api/github-stats/route.ts
import { colors, ThemeMode } from "@/lib/colors";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const username = process.env.GITHUB_USERNAME;

/**
 * Repo page GraphQL query (fetches stargazers, forks, pushedAt)
 * - uses 'after' for pagination
 */
const REPOS_PAGE_QUERY = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER, after: $after) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
          pushedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      pullRequests {
        totalCount
      }
      issues {
        totalCount
      }
    }
  }
`;

/** Search-commits REST endpoint headers require this Accept preview */
const COMMITS_SEARCH_ACCEPT = "application/vnd.github.cloak-preview";

/** Fetch all repository pages and return aggregated data */
async function fetchAllRepos(login: string) {
  let after: string | null = null;
  let done = false;

  let totalStars = 0;
  let totalForks = 0;
  let repoCount = 0;
  let activeReposLastYear = 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  // We'll also capture pullRequests and issues counts from first page
  let totalPRs = 0;
  let totalIssues = 0;
  let firstPageCaptured = false;

  while (!done) {
    const vars: { login: string; after?: string } = { login };
    if (after) vars.after = after;

    const res = await octokit.graphql<ReposPageResponse>(REPOS_PAGE_QUERY, vars);

    const user = res.user;
    if (!user) throw new Error("Could not fetch user data from GraphQL");

    // capture pr/issue totals from the first page (they are global counts)
    if (!firstPageCaptured) {
      totalPRs = user.pullRequests?.totalCount ?? 0;
      totalIssues = user.issues?.totalCount ?? 0;
      firstPageCaptured = true;
    }

    const repos = user.repositories.nodes ?? [];
    repoCount = user.repositories.totalCount ?? repoCount;

    for (const node of repos) {
      totalStars += node.stargazerCount ?? 0;
      totalForks += node.forkCount ?? 0;
      if (node.pushedAt) {
        const pushedAt = new Date(node.pushedAt).getTime();
        if (pushedAt >= oneYearAgo) activeReposLastYear++;
      }
    }

    const pageInfo = user.repositories.pageInfo;
    if (pageInfo && pageInfo.hasNextPage) {
      after = pageInfo.endCursor;
    } else {
      done = true;
    }
  }

  return {
    totalStars,
    totalForks,
    repoCount,
    activeReposLastYear,
    totalPRs,
    totalIssues,
  };
}

/** Fetch total commits authored by the user using the REST search commits endpoint */
async function fetchTotalCommitsAllTime(login: string) {
  if (!login) return 0;
  // Use search/commits REST endpoint which returns total_count
  // Important: this endpoint requires the Accept preview header
  try {
    const response = await octokit.request("GET /search/commits", {
      q: `author:${login}`,
      per_page: 1,
      headers: {
        accept: COMMITS_SEARCH_ACCEPT,
      },
    });
    // total_count contains the total matching commits
    const totalCount = response.data?.total_count ?? 0;
    return totalCount;
  } catch (err) {
    // If the request fails (rate limits or permission) fall back to 0 and log
    console.error("fetchTotalCommitsAllTime error:", err instanceof Error ? err.message : err);
    return 0;
  }
}

/** Calculates the exponential CDF. */
function exponentialCDF(x: number): number {
  return 1 - 2 ** -x;
}

/** Calculates the log-normal CDF (approximation). */
function logNormalCDF(x: number): number {
  return x / (1 + x);
}

/** Calculates the user's rank based on GitHub contributions. */
export function calculateRank(params: RankParams): RankResult {
  const { all_commits, totalCommits, prs, issues, reviews, stars, followers } = params;

  const COMMITS_MEDIAN = all_commits ? 1000 : 250;
  const COMMITS_WEIGHT = 2;

  const PRS_MEDIAN = 50;
  const PRS_WEIGHT = 3;

  const ISSUES_MEDIAN = 25;
  const ISSUES_WEIGHT = 1;

  const REVIEWS_MEDIAN = 2;
  const REVIEWS_WEIGHT = 1;

  const STARS_MEDIAN = 50;
  const STARS_WEIGHT = 4;

  const FOLLOWERS_MEDIAN = 10;
  const FOLLOWERS_WEIGHT = 1;

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT + STARS_WEIGHT + FOLLOWERS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  // Weighted contributions
  const weightedScore =
    COMMITS_WEIGHT * exponentialCDF(totalCommits / COMMITS_MEDIAN) +
    PRS_WEIGHT * exponentialCDF(prs / PRS_MEDIAN) +
    ISSUES_WEIGHT * exponentialCDF(issues / ISSUES_MEDIAN) +
    REVIEWS_WEIGHT * exponentialCDF(reviews / REVIEWS_MEDIAN) +
    STARS_WEIGHT * logNormalCDF(stars / STARS_MEDIAN) +
    FOLLOWERS_WEIGHT * logNormalCDF(followers / FOLLOWERS_MEDIAN);

  const rank = 1 - weightedScore / TOTAL_WEIGHT;

  // Find the corresponding level
  const levelIndex = THRESHOLDS.findIndex((t) => rank * 100 <= t);
  const level = LEVELS[levelIndex] ?? LEVELS[LEVELS.length - 1];

  return { level, percentile: rank * 100 };
}

/** Fetch total reviews across all repos */
async function fetchTotalReviewsAllTime(username: string) {
  let page = 1;
  let totalReviews = 0;

  while (true) {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      type: "owner",
      per_page: 100,
      page,
    });

    if (repos.length === 0) break;

    for (const repo of repos) {
      let prPage = 1;
      while (true) {
        const { data: prs } = await octokit.rest.pulls.list({
          owner: username,
          repo: repo.name,
          state: "all",
          per_page: 100,
          page: prPage,
        });

        if (prs.length === 0) break;

        for (const pr of prs) {
          const { data: reviews } = await octokit.rest.pulls.listReviews({
            owner: username,
            repo: repo.name,
            pull_number: pr.number,
          });
          totalReviews += reviews.length;
        }
        prPage++;
      }
    }

    page++;
  }

  return totalReviews;
}

/** Fetch total followers */
async function fetchFollowersCount(username: string) {
  const { data } = await octokit.rest.users.getByUsername({ username });
  return data.followers;
}

export async function buildStatsSvg(mode: ThemeMode) {
  // 🎨 Theme variables
  const theme = colors[mode];

  try {
    if (!username) throw new Error("Add github username in env.GITHUB_USERNAME");
    if (!process.env.GITHUB_TOKEN) throw new Error("Add github token in env.GITHUB_TOKEN");

    // Fetch paginated repos -> stars, forks, active repos, and get PR/issue totals.
    const { totalStars, totalForks, repoCount, activeReposLastYear, totalPRs, totalIssues } =
      await fetchAllRepos(username);

    // Fetch total commits (REST search)
    const totalCommits = await fetchTotalCommitsAllTime(username);
    const totalReviews = await fetchTotalReviewsAllTime(username);
    const totalFollowers = await fetchFollowersCount(username);

    const calcCircleProg = (v: number) => Math.PI * 80 * (1 - Math.min(Math.max(v, 0), 100) / 100);

    // Build the SVG using the same visual style as your provided card
    // --- Calculate rank ---
    const rank = calculateRank({
      all_commits: true, // or false depending on your logic
      totalCommits,
      prs: totalPRs,
      issues: totalIssues,
      reviews: totalReviews,
      stars: totalStars,
      followers: totalFollowers,
      repos: repoCount,
    });
    const width = 440;
    const height = 210;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="descId">
  <title id="titleId">${username}'s GitHub Stats, Rank: ${rank.level}</title>
  <desc id="descId">Total Stars: ${totalStars}, Forks: ${totalForks}, Commits: ${totalCommits}, PRs: ${totalPRs}, Issues: ${totalIssues}, Active Repos (last year): ${activeReposLastYear}</desc>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: ${theme.primary};
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    @supports(-moz-appearance: auto) {
      .header { font-size: 15.5px; }
    }

    .stat { font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${theme.secondary};}
    @supports(-moz-appearance: auto) { .stat { font-size:12px; } }

    .stagger { opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards; }

    .rank-text { font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${
      theme.accent
    }; animation: scaleInAnimation 0.3s ease-in-out forwards; }

    .rank-circle-rim { stroke: ${theme.textMuted}; fill: none; stroke-width: 6; opacity: 0.2; }
    .rank-circle { stroke: ${
      theme.secondary
    }; stroke-dasharray: 250; fill: none; stroke-width: 6; stroke-linecap: round; opacity: 0.8; transform-origin: -10px 8px; transform: rotate(-90deg); animation: rankAnimation 1s forwards ease-in-out; }

    @keyframes rankAnimation { 
      from { stroke-dashoffset: 251.32741228718345; } 
      to { stroke-dashoffset: 245.21308919715943; } 
    }

    @keyframes scaleInAnimation { 
      from { transform: translate(-5px, 5px) scale(0); } 
      to { transform: translate(-5px, 5px) scale(1); } 
    }
    @keyframes fadeInAnimation { 
      from { opacity: 0; } to { opacity: 1; } 
    }
    .bold { font-weight: 700 }
    @keyframes rankAnimation {
      from { stroke-dashoffset: ${calcCircleProg(0)}; }
      to { stroke-dashoffset: ${calcCircleProg(100 - rank.percentile)}; }
    }
  </style>

  <rect data-testid="card-bg" x="0.5" y="0.5" rx="7" height="99%" width="99%" fill="${
    theme.bg
  }" />

  <g data-testid="card-title" transform="translate(25, 35)">
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="header" data-testid="header">${username}'s GitHub Stats</text>
    </g>
  </g>

  <g data-testid="main-card-body" transform="translate(0, 55)">
    <g data-testid="rank-circle" transform="translate(365, 47.5)">
      <circle class="rank-circle-rim" cx="-10" cy="8" r="40"/>
      <circle class="rank-circle" cx="-10" cy="8" r="40"/>
      <g class="rank-text">
        <text x="-5" y="3" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" data-testid="level-rank-icon">
        ${rank.level}
        </text>
      </g>
    </g>

    <svg x="0" y="0">
      <g transform="translate(0, 0)">
        <g class="stagger" style="animation-delay: 450ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total Stars:</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="stars">${totalStars}</text>
        </g>
      </g>

      <g transform="translate(0, 25)">
        <g class="stagger" style="animation-delay: 600ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total Forks:</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="forks">${totalForks}</text>
        </g>
      </g>

      <g transform="translate(0, 50)">
        <g class="stagger" style="animation-delay: 750ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total Commits:</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="commits">${totalCommits}</text>
        </g>
      </g>

      <g transform="translate(0, 75)">
        <g class="stagger" style="animation-delay: 900ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total PRs:</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="prs">${totalPRs}</text>
        </g>
      </g>

      <g transform="translate(0, 100)">
        <g class="stagger" style="animation-delay: 1050ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total Issues:</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="issues">${totalIssues}</text>
        </g>
      </g>

      <g transform="translate(0, 125)">
        <g class="stagger" style="animation-delay: 1200ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Active Repos (1y):</text>
          <text class="stat bold" x="199.01" y="12.5" data-testid="active">${activeReposLastYear}</text>
        </g>
      </g>
    </svg>
  </g>
</svg>
`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "s-maxage=600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("GET error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="60"><text x="10" y="35" fill="red">Error: ${message}</text></svg>`;
    return new Response(errorSvg, { headers: { "Content-Type": "image/svg+xml" } });
  }
}

/** Type definitions (for clarity) */
type RepoNode = {
  name: string;
  stargazerCount: number;
  forkCount: number;
  pushedAt?: string | null;
};

type RankParams = {
  all_commits: boolean;
  totalCommits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
  repos?: number; // optional, not used in calculation
};

type RankResult = {
  level: string;
  percentile: number;
};

// --- Type for GraphQL repositories page response ---
type ReposPageResponse = {
  user: {
    repositories: {
      totalCount: number;
      nodes: RepoNode[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
  };
};
