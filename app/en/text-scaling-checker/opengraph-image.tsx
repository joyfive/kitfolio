import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Text Scaling & Spacing Checker | Kitfolio";

export default function Image() {
  return toolOgImage("text-scaling-checker", "en");
}
