import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "실업급여 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("unemployment-benefit-calculator", "ko");
}
