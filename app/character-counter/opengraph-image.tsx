import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "글자 수·단어 수 카운터 — Kitfolio";

export default function Image() {
  return toolOgImage("character-counter", "ko");
}
