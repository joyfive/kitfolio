import CssGradient from "../../components/CssGradient";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("css-gradient", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("css-gradient", "en")} />
      <CssGradient />
    </>
  );
}
