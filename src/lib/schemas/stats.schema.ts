import { z } from "zod";
import { themeNames } from "../themes/themeNames";
import { statsName } from "../renderers/stats-card";
import { booleanParam } from "./boolean-param";
import { cardFormats } from "../const";
import { supportedLocales } from "../i18n";

export const statsQuerySchema = z.object({
  theme: z.enum(themeNames).default("default"),
  format: z.enum(cardFormats).default("svg"),
  locale: z.enum(supportedLocales).default("en"),
  border: booleanParam.default(false),
  title: booleanParam.default(true),
  icons: booleanParam.default(true),
  custom_title: z.string().optional(),
  hide: z.array(z.enum(statsName)).optional(),
});
