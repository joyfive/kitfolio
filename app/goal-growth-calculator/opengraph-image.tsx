import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "goal-growth-calculator | Kitfolio";

export default function Image() {
  return toolOgImage("goal-growth-calculator", "ko");
}
