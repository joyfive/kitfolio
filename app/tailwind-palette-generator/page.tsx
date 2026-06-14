import TailwindPalette from "../components/TailwindPalette";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("tailwind-palette-generator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("tailwind-palette-generator", "ko")} />
      <TailwindPalette />
    </>
  );
}
