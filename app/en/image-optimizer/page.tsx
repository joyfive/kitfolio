import ImageOptimizer from "../../components/ImageOptimizer";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("image-optimizer", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("image-optimizer", "en")} />
      <ImageOptimizer />
    </>
  );
}
