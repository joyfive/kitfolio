import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("growth-rate-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("growth-rate-calculator", "en")} />
      <GrowthCalculator defaultMode="growth-rate" />
    </>
  );
}
