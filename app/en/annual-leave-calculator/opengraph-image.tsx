import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Korea Annual Leave Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("annual-leave-calculator", "en");
}
