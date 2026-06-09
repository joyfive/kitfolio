import type { Metadata } from "next";
import JsonFormatter from "./JsonFormatter";

export const metadata: Metadata = {
  title: "JSON 포매터 · Validator",
  description:
    "JSON 문자열을 붙여넣으면 들여쓰기와 색상 강조로 즉시 포맷팅합니다. 문법 오류를 줄·열 위치까지 짚어주고 유효성을 검사하며, 한 줄로 압축(minify)할 수도 있습니다. 모든 처리는 브라우저에서만 이루어집니다.",
  alternates: { canonical: "/json-formatter" },
};

export default function Page() {
  return <JsonFormatter />;
}
