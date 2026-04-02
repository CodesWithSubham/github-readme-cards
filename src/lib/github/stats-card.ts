import { ENV } from "../env";
import { getOctokit } from "../octokit";
import type { OctokitStatsResponse, RankResult, StatsData } from "./types";

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
          isPrivate
          isFork
          isArchived
        }
        pageInfo { hasNextPage endCursor }
      }
      pullRequests { totalCount }
      issues { totalCount }
      followers { totalCount }
      gists { totalCount }
      packages { totalCount }
    }
  }
`;

// Rank Calculator

function exponentialCDF(x: number): number {
  return 1 - 2 ** -x;
}

function logNormalCDF(x: number): number {
  return x / (1 + x);
}

type CalculateRankParams = {
  all_commits: boolean;
  totalCommits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
};

export function calculateRank(params: CalculateRankParams): RankResult {
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
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"] as const;

  const weightedScore =
    COMMITS_WEIGHT * exponentialCDF(totalCommits / COMMITS_MEDIAN) +
    PRS_WEIGHT * exponentialCDF(prs / PRS_MEDIAN) +
    ISSUES_WEIGHT * exponentialCDF(issues / ISSUES_MEDIAN) +
    REVIEWS_WEIGHT * exponentialCDF(reviews / REVIEWS_MEDIAN) +
    STARS_WEIGHT * logNormalCDF(stars / STARS_MEDIAN) +
    FOLLOWERS_WEIGHT * logNormalCDF(followers / FOLLOWERS_MEDIAN);

  const rank = 1 - weightedScore / TOTAL_WEIGHT;
  const levelIndex = THRESHOLDS.findIndex((t) => rank * 100 <= t);
  const level = LEVELS[levelIndex] ?? (LEVELS[LEVELS.length - 1] as string);

  return { level, percentile: rank * 100 };
}

async function fetchAllRepoPages(login: string) {
  const octokit = getOctokit();

  let after: string | null = null;
  let done = false;

  let totalStars = 0;
  let totalForks = 0;
  let repoCount = 0;
  let privateRepos = 0;
  let activeReposLastYear = 0;
  let totalPRs = 0;
  let totalIssues = 0;
  let totalFollowers = 0;
  let totalGists = 0;
  let totalPackages = 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  let firstPage = true;

  while (!done) {
    const vars: { login: string; after?: string } = { login };
    if (after) vars.after = after;

    const res = await octokit.graphql<OctokitStatsResponse>(REPOS_PAGE_QUERY, vars);
    const user = res.user;

    if (firstPage) {
      totalPRs = user.pullRequests?.totalCount ?? 0;
      totalIssues = user.issues?.totalCount ?? 0;
      totalFollowers = user.followers?.totalCount ?? 0;
      totalGists = user.gists?.totalCount ?? 0;
      totalPackages = user.packages?.totalCount ?? 0;
      firstPage = false;
    }

    const repos = user.repositories.nodes ?? [];
    repoCount = user.repositories.totalCount ?? repoCount;

    for (const node of repos) {
      if (node.isPrivate) privateRepos++;
      totalStars += node.stargazerCount ?? 0;
      totalForks += node.forkCount ?? 0;
      if (node.pushedAt && new Date(node.pushedAt).getTime() >= oneYearAgo) {
        activeReposLastYear++;
      }
    }

    const pageInfo = user.repositories.pageInfo;
    if (pageInfo?.hasNextPage) after = pageInfo.endCursor;
    else done = true;
  }

  return {
    totalStars,
    totalForks,
    repoCount,
    privateRepos,
    activeReposLastYear,
    totalPRs,
    totalIssues,
    totalFollowers,
    totalGists,
    totalPackages,
  };
}

async function fetchTotalCommits(login: string): Promise<number> {
  try {
    const octokit = getOctokit();
    const response = await octokit.request("GET /search/commits", {
      q: `author:${login}`,
      per_page: 1,
      headers: { accept: "application/vnd.github.cloak-preview" },
    });
    return response.data?.total_count ?? 0;
  } catch (err) {
    // If the request fails (rate limits or permission) fall back to 0 and log
    console.error("fetchTotalCommitsAllTime error:", err instanceof Error ? err.message : err);
    return 0;
  }
}

async function fetchTotalReviews(username: string): Promise<number> {
  try {
    const octokit = getOctokit();

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
  } catch (err) {
    console.error("fetchTotalReviews error:", err instanceof Error ? err.message : err);
    return 0;
  }
}

export async function getStatsData(): Promise<StatsData> {
  "use cache";

  const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;

  const [repoData, totalCommits, totalReviews] = await Promise.all([
    fetchAllRepoPages(username),
    fetchTotalCommits(username),
    fetchTotalReviews(username),
  ]);

  const {
    totalStars,
    totalForks,
    repoCount,
    privateRepos,
    activeReposLastYear,
    totalPRs,
    totalIssues,
    totalFollowers,
    totalGists,
    totalPackages,
  } = repoData;

  const octokit = getOctokit();
  const { data: userInfo } = await octokit.rest.users.getByUsername({ username });

  const rank = calculateRank({
    all_commits: true,
    totalCommits,
    prs: totalPRs,
    issues: totalIssues,
    reviews: totalReviews,
    stars: totalStars,
    followers: totalFollowers,
  });

  const stats = {
    username,
    name: userInfo.name ?? null,
    avatarUrl: userInfo.avatar_url,
    totalStars,
    totalForks,
    totalCommits,
    totalPRs,
    totalMergedPRs: 0,
    totalOpenPRs: 0,
    totalClosedPRs: 0,
    totalIssues,
    totalOpenIssues: 0,
    totalClosedIssues: 0,
    totalReviews,
    totalDiscussions: 0,
    totalGists,
    totalPackages,
    totalFollowers,
    totalFollowing: userInfo.following ?? 0,
    totalRepos: repoCount,
    totalPrivateRepos: privateRepos,
    activeReposLastYear,
    rank,
    fetchedAt: new Date().toISOString(),
  };

  return stats;
}
