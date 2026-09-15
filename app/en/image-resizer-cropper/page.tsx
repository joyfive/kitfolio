import ImageResizerCropper from "../../components/ImageResizerCropper";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("image-resizer-cropper", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("image-resizer-cropper", "en")} />
      <ImageResizerCropper />
    </>
  );
}
