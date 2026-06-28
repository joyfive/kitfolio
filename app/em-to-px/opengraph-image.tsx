import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Em to Px 변환기 — Kitfolio";

export default function Image() {
  return toolOgImage("em-to-px", "ko");
}
