import { z } from "zod";
import { themeNames } from "../themes/themeNames";
import { booleanParam } from "./boolean-param";
import { cardFormats } from "../const";
import { supportedLocales } from "../i18n";

export const achievementsQuerySchema = z.object({
  theme: z.enum(themeNames).default("default"),
  format: z.enum(cardFormats).default("svg"),
  locale: z.enum(supportedLocales).default("en"),
  border: booleanParam.default(true),
});
