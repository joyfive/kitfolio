import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CPA Calculator — Kitfolio";

export default function Image() {
  return toolOgImage("cpa-calculator", "en");
}
