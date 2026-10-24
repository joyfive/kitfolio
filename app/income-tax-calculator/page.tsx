import IncomeTaxCalculator from "../components/IncomeTaxCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("income-tax-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("income-tax-calculator", "ko")} />
      <IncomeTaxCalculator />
    </>
  );
}
