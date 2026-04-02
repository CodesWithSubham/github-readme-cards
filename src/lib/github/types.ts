// =============<[ Streak ]>=============

export type StreakContributionDay = {
  date: string;
  contributionCount: number;
};

export type OctokitStreakResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: StreakContributionDay[] }[];
      };
    };
  };
};

export type StreakData = {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreakStart: string;
  longestStreakEnd: string;
  totalRange: string;
  fetchedAt: string;
};

// =============<[ Stats ]>=============

type RepoNode = {
  name: string;
  stargazerCount: number;
  forkCount: number;
  pushedAt?: string | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
};

export type OctokitStatsResponse = {
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
    followers: { totalCount: number };
    gists: { totalCount: number };
    packages: { totalCount: number };
  };
};

export type RankResult = {
  level: string;
  percentile: number;
};

export type StatsData = {
  username: string;
  name: string | null;
  avatarUrl: string;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPRs: number;
  totalMergedPRs: number;
  totalOpenPRs: number;
  totalClosedPRs: number;
  totalIssues: number;
  totalOpenIssues: number;
  totalClosedIssues: number;
  totalReviews: number;
  totalDiscussions: number;
  totalGists: number;
  totalPackages: number;
  totalFollowers: number;
  totalFollowing: number;
  totalRepos: number;
  totalPrivateRepos: number;
  activeReposLastYear: number;
  rank: RankResult;
  fetchedAt: string;
};
