import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Korea Unemployment Benefit Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("unemployment-benefit-calculator", "en");
}
