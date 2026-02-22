import { buildTopLangSvg } from "./buildTopLangSvg";

export async function GET() {
  return await buildTopLangSvg("light");
}
