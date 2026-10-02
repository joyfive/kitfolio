import AnnualLeaveCalculator from "../../components/AnnualLeaveCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("annual-leave-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("annual-leave-calculator", "en")} />
      <AnnualLeaveCalculator />
    </>
  );
}
