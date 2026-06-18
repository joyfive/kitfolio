import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Time Calculator — Kitfolio";

export default function Image() {
  return toolOgImage("time-calculator", "en");
}
