import { buildStreakSvg } from "../buildStreakSvg";

export async function GET() {
  return await buildStreakSvg("dark");
}
