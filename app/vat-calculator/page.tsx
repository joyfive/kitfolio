import VatCalculator from "../components/VatCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("vat-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("vat-calculator", "ko")} />
      <VatCalculator />
    </>
  );
}
