import z from "zod";
import { themeNames } from "../themes/themeNames";

export const streakQuerySchema = z.object({
  theme: z.enum(themeNames).default("default"),
  format: z.enum(["svg", "png", "json", "markdown", "text"]).default("svg"),
  locale: z.enum(["en", "bn", "hi"]).default("en"),
  border: z.boolean().default(true),
});
