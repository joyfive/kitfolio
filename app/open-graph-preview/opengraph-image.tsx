import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "OG 미리보기 테스트 | Kitfolio";

export default function Image() {
  return toolOgImage("open-graph-preview", "ko");
}
