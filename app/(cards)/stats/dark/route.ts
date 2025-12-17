import { buildStatsSvg } from "../buildStatsSvg";

export const revalidate = 600; // 10 minutes

export async function GET() {
  return await buildStatsSvg("dark");
}
