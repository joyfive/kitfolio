import SlackMessageBuilder from "../components/SlackMessageBuilder";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("slack-message-builder", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("slack-message-builder", "ko")} />
      <SlackMessageBuilder />
    </>
  );
}
