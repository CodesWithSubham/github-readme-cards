import { type NextRequest } from "next/server";
import { getTheme } from "@/lib/themes";
import { getTopLanguages } from "@/lib/github/top-languages";
import { renderTopLangsCard, renderTopLangsMarkdown } from "@/lib/renderers/top-languages";
import { topLangQuerySchema } from "@/lib/schemas/top-lang.schema";
import { errorSvg } from "@/lib/renderers/error";
import { cacheControl } from "@/lib/cache-control";

export async function GET(req: NextRequest) {
  try {
    const query = topLangQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const {
      theme: themeName,
      format,
      locale,
      border,
      langs_count: langsCount,
      hide,
    } = query;

    const langs = await getTopLanguages(langsCount, hide);
    const theme = getTheme(themeName);

    if (format === "json") return Response.json(langs, { headers: cacheControl });
    if (format === "markdown" || format === "text")
      return new Response(renderTopLangsMarkdown(langs, locale), {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheControl },
      });

    return new Response(await renderTopLangsCard(langs, theme, { border, locale }), {
      headers: { "Content-Type": "image/svg+xml", ...cacheControl },
    });
  } catch (err) {
    return errorSvg(err instanceof Error ? err.message : String(err), 300, 60);
  }
}
