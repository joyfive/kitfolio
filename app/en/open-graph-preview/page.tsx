import OpenGraphPreview from "../../components/OpenGraphPreview";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("open-graph-preview", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("open-graph-preview", "en")} />
      <OpenGraphPreview />
    </>
  );
}
