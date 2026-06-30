import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Open Graph Preview Tester — Kitfolio";

export default function Image() {
  return toolOgImage("open-graph-preview", "en");
}
