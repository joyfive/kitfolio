import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("cagr-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("cagr-calculator", "en")} />
      <GrowthCalculator defaultMode="cagr" />
    </>
  );
}
