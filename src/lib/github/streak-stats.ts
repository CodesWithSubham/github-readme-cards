import { formatDate, formatShortDate } from "@/utils/format-date";
import { ENV } from "../env";
import { getOctokit } from "../octokit";
import type { OctokitStreakResponse, StreakContributionDay, StreakData } from "./types";

const CONTRIBUTIONS_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function getStreakData(): Promise<StreakData> {
  "use cache";

  const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;
  const year = ENV.GITHUB_JOINING_YEAR ?? new Date().getFullYear() - 2;

  const from = new Date(`${year}-01-01T00:00:00Z`);
  const to = new Date();
  const allDays: StreakContributionDay[] = [];
  let totalContributions = 0;

  let start = new Date(from);
  while (start < to) {
    const end = new Date(Math.min(to.getTime(), start.getTime() + 365 * 24 * 60 * 60 * 1000));
    const octokit = getOctokit();
    const { user } = await octokit.graphql<OctokitStreakResponse>(CONTRIBUTIONS_QUERY, {
      login: username,
      from: start.toISOString(),
      to: end.toISOString(),
    });
    const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (w) => w.contributionDays,
    );
    allDays.push(...days);
    totalContributions += user.contributionsCollection.contributionCalendar.totalContributions;
    start = new Date(end.getTime() + 1000);
  }

  allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate streaks
  let longestStreak = 0;
  let currentStreak = 0;

  let streak = 0;
  let streakStart = 0;

  let bestStart = 0;
  let bestEnd = 0;

  for (const [i, day] of allDays.entries()) {
    if (day.contributionCount > 0) {
      if (!streak) streakStart = i;
      streak++;
      if (streak > longestStreak) {
        longestStreak = streak;
        bestStart = streakStart;
        bestEnd = i;
      }
    } else {
      streak = 0;
    }
  }

  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    if (day && day.contributionCount > 0) currentStreak++;
    else break;
  }

  const currEnd = allDays.length - 1;
  const currStart = currEnd - currentStreak + 1;

  const firstActive = allDays.find((d) => d.contributionCount > 0);

  const now = new Date().toISOString();

  const stats = {
    username,
    currentStreak,
    longestStreak,
    totalContributions,
    currentStreakStart:
      currentStreak > 0 && allDays[currStart]
        ? formatShortDate(allDays[currStart].date)
        : formatShortDate(allDays[currEnd]?.date ?? now),
    currentStreakEnd:
      currentStreak > 0 && allDays[currEnd]
        ? formatShortDate(allDays[currEnd].date)
        : formatShortDate(now),
    longestStreakStart:
      bestStart >= 0 && allDays[bestStart] ? formatShortDate(allDays[bestStart]?.date ?? now) : "",
    longestStreakEnd:
      bestEnd >= 0 && allDays[bestEnd] ? formatShortDate(allDays[bestEnd]?.date ?? now) : "",
    totalRange: firstActive ? `${formatDate(firstActive.date)} - Present` : "",
    fetchedAt: now,
  };

  return stats;
}
