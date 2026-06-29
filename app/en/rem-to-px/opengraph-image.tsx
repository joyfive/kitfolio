import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Rem to Px Converter — Kitfolio";

export default function Image() {
  return toolOgImage("rem-to-px", "en");
}
