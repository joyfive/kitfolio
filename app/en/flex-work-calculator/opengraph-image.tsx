import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Flex Work Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("flex-work-calculator", "en");
}
