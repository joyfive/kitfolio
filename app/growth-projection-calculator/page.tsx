import GrowthCalculator from "../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("growth-projection-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("growth-projection-calculator", "ko")} />
      <GrowthCalculator mode="growth-projection" />
    </>
  );
}
