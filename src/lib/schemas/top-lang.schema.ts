import { z } from "zod";
import { themeNames } from "../themes/themeNames";
import { cardFormats } from "../const";
import { supportedLocales } from "../i18n";
import { booleanParam } from "./boolean-param";

export const topLangQuerySchema = z.object({
  theme: z.enum(themeNames).default("default"),
  format: z.enum(cardFormats).default("svg"),
  locale: z.enum(supportedLocales).default("en"),
  border: booleanParam.default(false),
  langs_count: z.coerce.number().int().min(1).max(20).default(6),
  hide: z
    .string()
    .transform((v) =>
      v
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .default([]),
});
