import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Web Accessibility Checklist Builder | Kitfolio";

export default function Image() {
  return toolOgImage("accessibility-checklist", "en");
}
