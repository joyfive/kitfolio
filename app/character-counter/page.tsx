import type { Metadata } from "next";
import CharacterCounter from "./CharacterCounter";

export const metadata: Metadata = {
  title: "글자 수·단어 수 카운터",
  description:
    "텍스트를 입력하면 글자 수, 단어 수, 문장 수, 줄 수, 단락 수를 실시간으로 집계합니다. 공백 포함·제외 글자 수와 예상 읽기 시간, 트위터·스레드·인스타그램 등 SNS 글자 수 제한 안내까지 제공합니다. 모든 처리는 브라우저 안에서 이루어집니다.",
  alternates: { canonical: "/character-counter" },
};

export default function Page() {
  return <CharacterCounter />;
}
