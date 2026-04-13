import { type NextRequest } from "next/server";
import {
  generateWorkflowYaml,
  CRON_PRESETS,
  type WorkflowConfig,
} from "@/lib/workflow/generator";
import { SECTION_DEFS } from "@/lib/workflow/markers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const meta = searchParams.get("meta") === "true";

  if (meta) {
    return Response.json({ sections: SECTION_DEFS, cronPresets: CRON_PRESETS });
  }

  const sectionsParam = searchParams.get("sections") ?? "stats,streak,top-lang";
  const sections = sectionsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s in SECTION_DEFS);

  if (!sections.length) {
    return Response.json(
      { error: "No valid sections. Use ?sections=stats,streak,top-lang" },
      { status: 400 },
    );
  }

  const cfg: WorkflowConfig = {
    sections,
    schedule: searchParams.get("schedule") ?? CRON_PRESETS[0].value,
    baseUrl: searchParams.get("base_url") ?? req.nextUrl.origin,
    themeName: searchParams.get("theme") ?? "github_dark",
    locale: searchParams.get("locale") ?? "en",
    readmeFile: searchParams.get("readme") ?? "README.md",
  };

  const yaml = generateWorkflowYaml(cfg);

  return new Response(yaml, {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Content-Disposition": 'attachment; filename="update-readme-cards.yml"',
      "Cache-Control": "no-store",
    },
  });
}
