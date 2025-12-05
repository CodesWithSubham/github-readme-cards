import { buildTopLangSvg } from "./buildTopLangSvg";

export const revalidate = 600; // 10 minutes

export async function GET() {
  return await buildTopLangSvg("light");
}
