import FlexWorkCalculator from "../components/FlexWorkCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("flex-work-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("flex-work-calculator", "ko")} />
      <FlexWorkCalculator />
    </>
  );
}
