import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Funnel Conversion Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("funnel-conversion-calculator", "en");
}
