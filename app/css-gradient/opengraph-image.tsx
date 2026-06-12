import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CSS 그라디언트 생성기 — Kitfolio";

export default function Image() {
  return toolOgImage("css-gradient", "ko");
}
