import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vw to Px Converter — Kitfolio";

export default function Image() {
  return toolOgImage("vw-to-px", "en");
}
