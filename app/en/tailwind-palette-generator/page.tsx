import TailwindPalette from "../../components/TailwindPalette";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("tailwind-palette-generator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("tailwind-palette-generator", "en")} />
      <TailwindPalette />
    </>
  );
}
