import UnitConverter from "../components/UnitConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("css-unit-converter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("css-unit-converter", "ko")} />
      <UnitConverter />
    </>
  );
}
