import z from "zod";

export const booleanParam = z
  .string()
  .optional()
  .transform((v) => {
    if (v == null) return undefined;

    return !["false", "0", "off", "no"].includes(v.toLowerCase());
  });
