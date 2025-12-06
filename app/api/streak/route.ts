import { buildStreakSvg } from "./buildStreakSvg";

export const revalidate = 600; // 10 minutes

export async function GET() {
  return await buildStreakSvg("light");
}
