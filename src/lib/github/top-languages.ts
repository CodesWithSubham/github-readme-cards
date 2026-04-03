import { ENV } from "../env";
import { getOctokit } from "../octokit";
import type { OctokitTopLanguagesResponse, TopLanguagesData } from "./types";

const TOP_LANGUAGES_QUERY = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      repositories(first: 100, isFork: false, ownerAffiliations: OWNER, after: $after) {
        nodes {
          languages(first: 10) {
            edges {
              size
              node { name color }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export async function getTopLanguages(
  count = 6,
  hide: string[] = [],
): Promise<TopLanguagesData[]> {
  "use cache";

  const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;
  let after: string | null = null;
  let done = false;
  const totals: Record<string, { size: number; color: string }> = {};

  while (!done) {
    const octokit = getOctokit();
    const res: OctokitTopLanguagesResponse = await octokit.graphql(TOP_LANGUAGES_QUERY, {
      login: username,
      after,
    });
    const repos = res.user?.repositories?.nodes ?? [];
    for (const repo of repos) {
      for (const edge of repo.languages?.edges ?? []) {
        const { name, color } = edge.node;
        if (hide.includes(name.toLowerCase())) continue;
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
  const langs = Object.entries(totals)
    .map(([name, { size, color }]) => ({
      name,
      color,
      percent: (size / totalSize) * 100,
      bytes: size,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, count);

  return langs;
}
