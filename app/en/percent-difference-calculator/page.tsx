import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("percent-difference-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("percent-difference-calculator", "en")} />
      <GrowthCalculator mode="percent-difference" />
    </>
  );
}
