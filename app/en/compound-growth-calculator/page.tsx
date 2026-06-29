import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("compound-growth-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("compound-growth-calculator", "en")} />
      <GrowthCalculator mode="compound-growth" />
    </>
  );
}
