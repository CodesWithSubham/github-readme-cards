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
