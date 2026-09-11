import TextScalingChecker from "../../components/TextScalingChecker";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("text-scaling-checker", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("text-scaling-checker", "en")} />
      <TextScalingChecker />
    </>
  );
}
