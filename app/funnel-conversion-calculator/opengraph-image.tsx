import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "퍼널 전환율 계산기 — Kitfolio";

export default function Image() {
  return toolOgImage("funnel-conversion-calculator", "ko");
}
