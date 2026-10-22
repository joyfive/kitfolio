import UnemploymentBenefitCalculator from "../../components/UnemploymentBenefitCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("unemployment-benefit-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("unemployment-benefit-calculator", "en")} />
      <UnemploymentBenefitCalculator />
    </>
  );
}
