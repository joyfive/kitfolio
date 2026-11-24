import ResumeBuilder from "../../components/ResumeBuilder";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("resume-builder", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("resume-builder", "en")} />
      <ResumeBuilder />
    </>
  );
}
