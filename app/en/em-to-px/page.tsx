import UnitConverter from "../../components/UnitConverter";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("em-to-px", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("em-to-px", "en")} />
      <UnitConverter mode="em-px" />
    </>
  );
}
