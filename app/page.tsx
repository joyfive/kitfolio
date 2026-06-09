import Hub from "./components/Hub";
import JsonLd from "./components/JsonLd";
import { buildHubMetadata, hubJsonLd } from "./lib/content";

export const metadata = buildHubMetadata("ko");

export default function Page() {
  return (
    <>
      <JsonLd data={hubJsonLd("ko")} />
      <Hub />
    </>
  );
}
