import { cacheControl } from "@/lib/cache-control";
import { getAchievementsData } from "@/lib/github/achievements";
import { errorSvg } from "@/lib/renderers/error";
import { renderAchievementsCard, renderAchievementsMarkdown } from "@/lib/renderers/achievements";
import { achievementsQuerySchema } from "@/lib/schemas/achievements.schema";
import { getTheme } from "@/lib/themes";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const query = achievementsQuerySchema.parse(params);

    const { theme: themeName, format, border } = query;

    const badges = await getAchievementsData();
    const theme = getTheme(themeName);
    const username = ENV.NEXT_PUBLIC_GITHUB_USERNAME;

    if (format === "json") return Response.json(badges, { headers: cacheControl });

    if (format === "markdown" || format === "text") {
      const body = renderAchievementsMarkdown(badges, username);
      return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheControl },
      });
    }

    const svg = renderAchievementsCard(badges, username, theme, { border });
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml", ...cacheControl } });
  } catch (err) {
    return errorSvg(err instanceof Error ? err.message : String(err), 380, 60);
  }
}
