import { buildStatsSvg } from "./buildStatsSvg";

export async function GET() {
  return await buildStatsSvg("light");
}
