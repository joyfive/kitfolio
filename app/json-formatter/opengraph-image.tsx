import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "JSON 포매터 · 검증기 — Kitfolio";

export default function Image() {
  return toolOgImage("json-formatter", "ko");
}
