import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "웹접근성 체크리스트 빌더 | Kitfolio";

export default function Image() {
  return toolOgImage("accessibility-checklist", "ko");
}
