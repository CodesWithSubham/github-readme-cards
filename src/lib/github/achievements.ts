import { ENV } from "../env";
import { getOctokit } from "../octokit";
import type { AchievementBadge } from "../renderers/achievements";

const METADATA: Record<
  string,
  { emoji: string; description: string; tier: "bronze" | "silver" | "gold" | "x"; src: string }
> = {
  "pull-shark": {
    emoji: "🦈",
    description: "Opened merged PRs",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png",
  },
  yolo: {
    emoji: "🎯",
    description: "Merges without a review",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png",
  },
  "pair-extraordinaire": {
    emoji: "🤝",
    description: "Co-authored commits",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/pair-extraordinaire-default-579438a20e01.png",
  },
  "galaxy-brain": {
    emoji: "🧠",
    description: "Helpful discussion answers",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/galaxy-brain-default-81a95e0c52bb.png",
  },
  starstruck: {
    emoji: "🌟",
    description: "Created starred repos",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/starstruck-default-b6610dba3351.png",
  },
  quickdraw: {
    emoji: "🏹",
    description: "Closed issues/PRs quickly",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/quickdraw-default-380eb99fb959.png",
  },
  "heart-on-your-sleeve": {
    emoji: "💖",
    description: "Supports open source work",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/heart-on-your-sleeve-default-81a95e0c52bb.png",
  },
  "arctic-code-vault-contributor": {
    emoji: "❄️",
    description: "Preserved code in the Arctic Vault",
    tier: "x",
    src: "https://github.githubassets.com/assets/arctic-code-vault-contributor-default-dfa2c6d48259.png",
  },
  "mars-2020-contributor": {
    emoji: "🚀",
    description: "Contributed code to Mars Helicopter",
    tier: "gold",
    src: "https://github.githubassets.com/assets/mars-2020-contributor-default-81a95e0c52bb.png",
  },
  "public-sponsor": {
    emoji: "❤️",
    description: "Sponsors developers",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/public-sponsor-default-81a95e0c52bb.png",
  },
  "developer-program-member": {
    emoji: "💻",
    description: "Developer Program Member",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/developer-program-member-default-81a95e0c52bb.png",
  },
  followup: {
    emoji: "👣",
    description: "Followers target reached",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/starstruck-default-b6610dba3351.png",
  },
  devhero: {
    emoji: "🦸",
    description: "Open source contributor",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/developer-program-member-default-81a95e0c52bb.png",
  },
  sponsor: {
    emoji: "❤️",
    description: "Supports open-source work",
    tier: "bronze",
    src: "https://github.githubassets.com/assets/public-sponsor-default-81a95e0c52bb.png",
  },
};

async function getBase64Image(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error("Failed to convert image to base64:", err);
    return "";
  }
}

export async function scrapeAchievements(username: string): Promise<AchievementBadge[]> {
  try {
    const url = `https://github.com/${username}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch GitHub profile HTML: ${res.status}`);
    }

    const html = await res.text();
    const aRegex = /<a href="[^"]+achievement=([^&"]+)&amp;tab=achievements"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    const badgesMap = new Map<string, AchievementBadge>();

    while ((match = aRegex.exec(html)) !== null) {
      const id = match[1];
      const content = match[2];
      if (!id || !content) continue;

      const altMatch = content.match(/alt="Achievement: ([^"]+)"/);
      if (!altMatch || !altMatch[1]) continue;
      const name = altMatch[1];

      const labelMatch = content.match(
        /<span[^>]+class="[^"]*achievement-tier-label--([^\s"]+)[^"]*"[^>]*>([^<]+)<\/span>/,
      );

      const meta = METADATA[id] || {
        emoji: "🏆",
        description: "GitHub Achievement",
        tier: "bronze",
        src: "",
      };

      const parsedTier =
        labelMatch && labelMatch[1]
          ? (labelMatch[1] as "bronze" | "silver" | "gold" | "x")
          : meta.tier;
      const count = labelMatch && labelMatch[2] ? labelMatch[2].trim() : "x1";

      // Use scraped image URL, or fallback to metadata src
      const srcMatch = content.match(/src="([^"]+)"/);
      const srcUrl = srcMatch && srcMatch[1] ? srcMatch[1] : meta.src;

      if (!badgesMap.has(id)) {
        badgesMap.set(id, {
          id,
          name,
          emoji: meta.emoji,
          description: meta.description,
          tier: parsedTier,
          count,
          src: srcUrl,
        });
      }
    }

    return Array.from(badgesMap.values());
  } catch (err) {
    console.error("scrapeAchievements error, falling back:", err);
    return [];
  }
}

export async function inferAchievements(username: string): Promise<AchievementBadge[]> {
  try {
    const octokit = getOctokit();
    const { data: user } = await octokit.rest.users.getByUsername({ username });
    const badges: AchievementBadge[] = [];
    const repos = user.public_repos ?? 0;
    const followers = user.followers ?? 0;
    const yearsOnGH = user.created_at
      ? (Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 3600 * 1000)
      : 0;

    if (repos >= 1) {
      const meta = METADATA["starstruck"]!;
      badges.push({
        id: "starstruck",
        name: "Starstruck",
        emoji: meta.emoji,
        description: meta.description,
        tier: repos >= 50 ? "gold" : repos >= 10 ? "silver" : "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (followers >= 2) {
      const meta = METADATA["followup"]!;
      badges.push({
        id: "followup",
        name: "Follower",
        emoji: meta.emoji,
        description: `${followers} followers`,
        tier: followers >= 128 ? "gold" : followers >= 32 ? "silver" : "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (repos >= 5) {
      const meta = METADATA["yolo"]!;
      badges.push({
        id: "yolo",
        name: "YOLO",
        emoji: meta.emoji,
        description: meta.description,
        tier: "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (repos >= 10) {
      const meta = METADATA["pull-shark"]!;
      badges.push({
        id: "pull-shark",
        name: "Pull Shark",
        emoji: meta.emoji,
        description: meta.description,
        tier: repos >= 50 ? "gold" : repos >= 24 ? "silver" : "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (repos >= 3) {
      const meta = METADATA["galaxy-brain"]!;
      badges.push({
        id: "galaxy-brain",
        name: "Galaxy Brain",
        emoji: meta.emoji,
        description: meta.description,
        tier: "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (yearsOnGH >= 1) {
      const meta = METADATA["pair-extraordinaire"]!;
      badges.push({
        id: "pair-extraordinaire",
        name: "Pair Extraordinaire",
        emoji: meta.emoji,
        description: meta.description,
        tier: yearsOnGH >= 4 ? "gold" : yearsOnGH >= 2 ? "silver" : "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (repos >= 2) {
      const meta = METADATA["devhero"]!;
      badges.push({
        id: "devhero",
        name: "Dev Hero",
        emoji: meta.emoji,
        description: meta.description,
        tier: "bronze",
        count: "x1",
        src: meta.src,
      });
    }
    if (yearsOnGH >= 1) {
      const meta = METADATA["sponsor"]!;
      badges.push({
        id: "sponsor",
        name: "Public Sponsor",
        emoji: meta.emoji,
        description: meta.description,
        tier: "bronze",
        count: "x1",
        src: meta.src,
      });
    }

    return badges;
  } catch (err) {
    console.error("inferAchievements error:", err);
    return [];
  }
}

export async function getAchievementsData(): Promise<AchievementBadge[]> {
  const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;
  let badges = await scrapeAchievements(username);
  if (badges.length === 0) {
    badges = await inferAchievements(username);
  }

  // Inline all image URLs to base64 Data URIs
  const inlinedBadges = await Promise.all(
    badges.map(async (badge) => {
      if (badge.src && badge.src.startsWith("http")) {
        const base64 = await getBase64Image(badge.src);
        if (base64) {
          return { ...badge, src: base64 };
        }
      }
      return badge;
    }),
  );

  return inlinedBadges;
}
