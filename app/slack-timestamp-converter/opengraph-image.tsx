import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "슬랙 타임스탬프 변환기 — Kitfolio";

export default function Image() {
  return toolOgImage("slack-timestamp-converter", "ko");
}
