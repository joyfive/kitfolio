import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Korea VAT Calculator | Kitfolio";

export default function Image() {
  return toolOgImage("vat-calculator", "en");
}
