import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "growth-rate-calculator — Kitfolio";

export default function Image() {
  return toolOgImage("growth-rate-calculator", "en");
}
