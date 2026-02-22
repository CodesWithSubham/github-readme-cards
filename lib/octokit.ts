import { Octokit } from "octokit";

export function getOctokit() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
}
