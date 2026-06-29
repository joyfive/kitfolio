import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "qoq-growth-calculator — Kitfolio";

export default function Image() {
  return toolOgImage("qoq-growth-calculator", "ko");
}
