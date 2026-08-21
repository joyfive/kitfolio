import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lunar-Solar Converter | Kitfolio";

export default function Image() {
  return toolOgImage("lunar-solar-converter", "en");
}
