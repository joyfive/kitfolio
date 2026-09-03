import SeverancePayCalculator from "../components/SeverancePayCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("severance-pay-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("severance-pay-calculator", "ko")} />
      <SeverancePayCalculator />
    </>
  );
}
