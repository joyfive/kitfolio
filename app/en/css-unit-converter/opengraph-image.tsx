import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "CSS Unit Converter | Kitfolio";

export default function Image() {
  return toolOgImage("css-unit-converter", "en");
}
