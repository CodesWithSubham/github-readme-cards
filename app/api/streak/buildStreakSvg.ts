import { colors, ThemeMode } from "@/lib/colors";
import { Octokit } from "octokit";

export const revalidate = 600; // cache 10

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const username = process.env.GITHUB_USERNAME;

const query = `
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

async function fetchContributions(username: string, from: Date, to: Date) {
  const contributions: ContributionDay[] = [];
  let start = new Date(from);
  let end = new Date(Math.min(to.getTime(), start.getTime() + 365 * 24 * 60 * 60 * 1000));

  let totalContributions = 0;

  while (start.getTime() < to.getTime()) {
    const variables = { login: username, from: start.toISOString(), to: end.toISOString() };

    const { user } = await octokit.graphql<GitHubUserResponse>(query, variables);

    // Flatten weeks → contributionDays
    const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (w) => w.contributionDays
    );

    contributions.push(...days);

    // Update total contributions
    totalContributions += user.contributionsCollection.contributionCalendar.totalContributions;

    // Move 1 year ahead
    start = new Date(end.getTime() + 1000); // add 1 second to avoid overlap
    end = new Date(Math.min(to.getTime(), start.getTime() + 365 * 24 * 60 * 60 * 1000));
  }

  return { contributions, totalContributions };
}

export async function buildStreakSvg(mode: ThemeMode) {
  const theme = colors[mode];
  try {
    const joiningYear = parseInt(process.env.GITHUB_JOINING_YEAR || "2023", 10);
    const from = new Date(`${joiningYear}-01-01T00:00:00Z`);
    const to = new Date(); // today
    if (!username) throw new Error("Add github username in env.GITHUB_USERNAME");
    const fetchedData = await fetchContributions(username, from, to);

    const days = fetchedData.contributions;
    const totalContributions = fetchedData.totalContributions;

    // Sort ascending by date
    days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // --- Compute streaks ---
    function computeStreaks(days: ContributionDay[]) {
      let longest = 0;
      let temp = 0;

      // Longest streak
      for (let i = 0; i < days.length; i++) {
        if (days[i].contributionCount > 0) {
          temp++;
          if (temp > longest) longest = temp;
        } else {
          temp = 0;
        }
      }

      // Current streak: count consecutive days from the last active day
      let current = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].contributionCount > 0) current++;
        else break; // streak broken
      }

      return { currentStreak: current, longestStreak: longest };
    }

    const { currentStreak, longestStreak } = computeStreaks(days);

    // --- Find the start and end indices for the longest streak ---
    let bestStart = -1,
      bestEnd = -1;
    {
      let tempStart = 0,
        tempLen = 0;
      for (let i = 0; i < days.length; i++) {
        if (days[i].contributionCount > 0) {
          if (tempLen === 0) tempStart = i;
          tempLen++;
          if (tempLen > bestEnd - bestStart + 1) {
            bestStart = tempStart;
            bestEnd = i;
          }
        } else {
          tempLen = 0;
        }
      }
    }

    // --- Helpers for displaying ranges ---
    function formatStreakRange(days: ContributionDay[], startIdx: number, endIdx: number) {
      const start = new Date(days[startIdx].date);
      const end = new Date(days[endIdx].date);
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString(
        "en-US",
        opts
      )}`;
    }

    function formatTotalRange(firstDate: string) {
      const date = new Date(firstDate);
      console.log("date", date);
      return `${date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })} - Present`;
    }

    // --- Format longest streak range ---
    const longestRange =
      bestStart >= 0 && bestEnd >= 0 ? formatStreakRange(days, bestStart, bestEnd) : "";

    // --- Format current streak range ---
    let currRange = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (currentStreak > 0) {
      const endIdx = days.findIndex((_d, i) => i === days.length - 1); // last day with data
      const startIdx = endIdx - currentStreak + 1;
      currRange = formatStreakRange(days, startIdx, endIdx);
    }

    // --- Total contribution date range ---
    const firstActive = days.find((d) => d.contributionCount > 0);
    const totalRange = firstActive ? formatTotalRange(firstActive.date) : "";

    // Now build the SVG
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation: isolate" viewBox="0 0 495 195" width="495px" height="195px" direction="ltr">
  <style>
    @keyframes currstreak {
      0% { font-size: 3px; opacity: 0.2; }
      80% { font-size: 34px; opacity: 1; }
      100% { font-size: 28px; opacity: 1; }
    }
    @keyframes fadein {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  </style>
  <defs>
    <clipPath id="outer_rectangle">
      <rect width="495" height="195" rx="4.5"/>
    </clipPath>
    <mask id="mask_out_ring_behind_fire">
      <rect width="495" height="195" fill="white"/>
      <ellipse id="mask-ellipse" cx="247.5" cy="32" rx="13" ry="18" fill="black"/>
    </mask>
  </defs>
  <g clip-path="url(#outer_rectangle)">
    <rect stroke="${theme.border}" stroke-opacity="0" fill="${theme.bg}" rx="10" x="0.5" y="0.5" width="494" height="194"/>

    <g>
      <line x1="165" y1="28" x2="165" y2="170" vector-effect="non-scaling-stroke" stroke-width="1" stroke="${theme.divider}"/>
      <line x1="330" y1="28" x2="330" y2="170" vector-effect="non-scaling-stroke" stroke-width="1" stroke="${theme.divider}"/>
    </g>

    <!-- Total Contributions -->
    <g>
      <g transform="translate(82.5, 48)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="opacity:0;animation:fadein 0.5s linear forwards 0.6s">
          ${totalContributions}
        </text>
      </g>
      <g transform="translate(82.5, 84)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 0.7s">
          Total Contributions
        </text>
      </g>
      <g transform="translate(82.5, 114)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 0.8s">
          ${totalRange}
        </text>
      </g>
    </g>

    <!-- Current Streak -->
    <g>
      <g transform="translate(247.5, 48)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.accent}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="animation:currstreak 0.6s linear forwards">
          ${currentStreak}
        </text>
      </g>
      <g transform="translate(247.5, 108)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.accent}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 0.9s">
          Current Streak
        </text>
      </g>
      <g transform="translate(247.5, 145)">
        <text x="0" y="21" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 0.9s">
          ${currRange}
        </text>
      </g>
      <g mask="url(#mask_out_ring_behind_fire)">
        <circle cx="247.5" cy="71" r="40" fill="none" stroke="${theme.primary}" stroke-width="5" style="opacity:0;animation:fadein 0.5s linear forwards 0.4s"/>
      </g>
      <g transform="translate(247.5, 19.5)" style="opacity:0;animation:fadein 0.5s linear forwards 0.6s">
        <path d="M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z" fill="none"/>
        <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${theme.primary}"/>
      </g>
    </g>

    <!-- Longest Streak -->
    <g>
      <g transform="translate(412.5, 48)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="opacity:0;animation:fadein 0.5s linear forwards 1.2s">
          ${longestStreak}
        </text>
      </g>
      <g transform="translate(412.5, 84)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.primary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity:0;animation:fadein 0.5s linear forwards 1.3s">
          Longest Streak
        </text>
      </g>
      <g transform="translate(412.5, 114)">
        <text x="0" y="32" text-anchor="middle" fill="${theme.secondary}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity:0;animation:fadein 0.5s linear forwards 1.4s">
          ${longestRange}
        </text>
      </g>
    </g>

  </g>
</svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "s-maxage=600, stale-while-revalidate",
      },
    });
  } catch (error) {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" fill="red">${
        error instanceof Error ? `Error: ${error.message}` : "Something Wrong!"
      }</text></svg>`,
      { headers: { "Content-Type": "image/svg+xml" } }
    );
  }
}

type ContributionDay = {
  date: string;
  contributionCount: number;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
};

type ContributionsCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

type ContributionsCollection = {
  contributionCalendar: ContributionsCalendar;
};

type GitHubUser = {
  login: string;
  contributionsCollection: ContributionsCollection;
};

type GitHubUserResponse = {
  user: GitHubUser;
};
