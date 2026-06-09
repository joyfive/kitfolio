import JsonFormatter from "../../components/JsonFormatter";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("json-formatter", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("json-formatter", "en")} />
      <JsonFormatter />
    </>
  );
}
