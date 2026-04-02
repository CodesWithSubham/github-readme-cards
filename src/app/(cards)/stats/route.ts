import { cacheControl } from "@/lib/cache-control";
import { getStatsData } from "@/lib/github/stats-card";
import { errorSvg } from "@/lib/renderers/error";
import { renderStatsAscii, renderStatsCard, renderStatsMarkdown } from "@/lib/renderers/stats-card";
import { statsQuerySchema } from "@/lib/schemas/stats.schema";
import { getTheme } from "@/lib/themes";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const query = statsQuerySchema.parse(params);

    const {
      theme: themeName,
      format,
      locale,
      border,
      title,
      icons,
      custom_title: customTitle,
      hide: hiddenStats,
    } = query;

    const stats = await getStatsData();
    const theme = getTheme(themeName);

    if (format === "json") return Response.json(stats, { headers: cacheControl });

    if (format === "markdown" || format === "text") {
      const body =
        format === "text"
          ? await renderStatsAscii(stats)
          : await renderStatsMarkdown(stats, { locale });
      return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheControl },
      });
    }

    const svg = await renderStatsCard(stats, theme, {
      icons,
      border,
      title,
      customTitle,
      hiddenStats,
      locale,
    });
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml", ...cacheControl } });
  } catch (err) {
    return errorSvg(err instanceof Error ? err.message : String(err), 450, 60);
  }
}
