import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ms to S 변환기 — Kitfolio";

export default function Image() {
  return toolOgImage("ms-to-s", "ko");
}
