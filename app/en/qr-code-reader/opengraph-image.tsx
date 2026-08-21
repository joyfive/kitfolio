import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "QR Code Reader | Kitfolio";

export default function Image() {
  return toolOgImage("qr-code-reader", "en");
}
