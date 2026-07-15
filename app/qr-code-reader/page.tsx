import QrCodeReader from "../components/QrCodeReader";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("qr-code-reader", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("qr-code-reader", "ko")} />
      <QrCodeReader />
    </>
  );
}
