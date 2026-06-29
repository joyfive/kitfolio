import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "wow-growth-calculator — Kitfolio";

export default function Image() {
  return toolOgImage("wow-growth-calculator", "ko");
}
