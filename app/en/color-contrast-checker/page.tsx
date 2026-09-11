import ColorContrastChecker from "../../components/ColorContrastChecker";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("color-contrast-checker", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("color-contrast-checker", "en")} />
      <ColorContrastChecker />
    </>
  );
}
