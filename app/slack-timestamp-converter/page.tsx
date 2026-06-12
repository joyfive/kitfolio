import SlackTimestampConverter from "../components/SlackTimestampConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("slack-timestamp-converter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("slack-timestamp-converter", "ko")} />
      <SlackTimestampConverter />
    </>
  );
}
