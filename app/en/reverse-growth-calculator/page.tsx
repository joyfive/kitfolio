import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("reverse-growth-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("reverse-growth-calculator", "en")} />
      <GrowthCalculator mode="reverse-growth" />
    </>
  );
}
