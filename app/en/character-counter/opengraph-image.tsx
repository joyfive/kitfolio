import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Character & Word Counter — Kitfolio";

export default function Image() {
  return toolOgImage("character-counter", "en");
}
