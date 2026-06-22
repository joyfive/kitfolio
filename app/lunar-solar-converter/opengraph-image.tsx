import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "음력 양력 변환기 — Kitfolio";

export default function Image() {
  return toolOgImage("lunar-solar-converter", "ko");
}
