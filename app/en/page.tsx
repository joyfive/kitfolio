import Hub from "../components/Hub";
import JsonLd from "../components/JsonLd";
import { buildHubMetadata, hubJsonLd } from "../lib/content";

export const metadata = buildHubMetadata("en");

export default function Page() {
  return (
    <>
      <JsonLd data={hubJsonLd("en")} />
      <Hub />
    </>
  );
}
