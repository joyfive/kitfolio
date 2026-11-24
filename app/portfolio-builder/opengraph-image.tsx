import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "포트폴리오 빌더 | Kitfolio";

export default function Image() {
  return toolOgImage("portfolio-builder", "ko");
}
