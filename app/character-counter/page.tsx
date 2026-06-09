import CharacterCounter from "../components/CharacterCounter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("character-counter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("character-counter", "ko")} />
      <CharacterCounter />
    </>
  );
}
