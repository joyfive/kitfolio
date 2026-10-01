import FreelancerTaxCalculator from "../../components/FreelancerTaxCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("freelancer-tax-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("freelancer-tax-calculator", "en")} />
      <FreelancerTaxCalculator />
    </>
  );
}
