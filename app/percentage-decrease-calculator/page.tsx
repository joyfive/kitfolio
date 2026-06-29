import GrowthCalculator from "../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("percentage-decrease-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("percentage-decrease-calculator", "ko")} />
      <GrowthCalculator mode="percentage-decrease" />
    </>
  );
}
