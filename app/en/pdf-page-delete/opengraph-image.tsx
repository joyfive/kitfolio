import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Delete PDF Pages — Kitfolio";

export default function Image() {
  return toolOgImage("pdf-page-delete", "en");
}
