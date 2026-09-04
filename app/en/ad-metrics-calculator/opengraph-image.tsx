import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ad Metrics Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("ad-metrics-calculator", "en");
}
