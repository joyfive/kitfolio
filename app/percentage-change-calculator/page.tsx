import GrowthCalculator from "../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("percentage-change-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("percentage-change-calculator", "ko")} />
      <GrowthCalculator mode="percentage-change" />
    </>
  );
}
