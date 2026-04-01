import { cacheControl } from "@/lib/cache-control";
import { getStreakData } from "@/lib/github/streak-stats";
import { errorSvg } from "@/lib/renderers/error";
import { renderStreakCard, renderStreakMarkdown } from "@/lib/renderers/streak-card";
import { streakQuerySchema } from "@/lib/schemas/streak.schema";
import { getTheme } from "@/lib/themes";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const query = streakQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const { theme: themeName, format, locale, border } = query;
    const stats = await getStreakData();

    if (format === "json") return Response.json(stats, { headers: cacheControl });

    if (format === "markdown" || format === "text")
      return new Response(await renderStreakMarkdown(stats), {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheControl },
      });

    const theme = getTheme(themeName);
    return new Response(await renderStreakCard(stats, theme, { border, locale }), {
      headers: { "Content-Type": "image/svg+xml", ...cacheControl },
    });
  } catch (err) {
    return errorSvg(err instanceof Error ? err.message : String(err), 450, 60);
  }
}
