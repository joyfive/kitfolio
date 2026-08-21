import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CPC Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("cpc-calculator", "en");
}
