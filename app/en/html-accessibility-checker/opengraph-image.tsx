import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "HTML Accessibility Checker | Kitfolio";

export default function Image() {
  return toolOgImage("html-accessibility-checker", "en");
}
