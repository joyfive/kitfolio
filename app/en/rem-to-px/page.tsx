import UnitConverter from "../../components/UnitConverter";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("rem-to-px", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("rem-to-px", "en")} />
      <UnitConverter mode="rem-px" />
    </>
  );
}
