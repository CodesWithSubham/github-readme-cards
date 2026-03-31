import "server-only";

import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  GITHUB_TOKEN: z.string(),
  GITHUB_JOINING_YEAR: z.coerce.number().int().min(2008).max(new Date().getFullYear()).default(2008),
  NEXT_PUBLIC_GITHUB_USERNAME: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  console.error(
    parsed.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`).join("\n"),
  );
  process.exit(1);
}

export const ENV = parsed.data;
export type Env = typeof ENV;
