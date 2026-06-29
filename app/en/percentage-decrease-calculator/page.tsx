import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("percentage-decrease-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("percentage-decrease-calculator", "en")} />
      <GrowthCalculator mode="percentage-decrease" />
    </>
  );
}
