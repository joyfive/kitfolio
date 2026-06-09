import type { Metadata } from "next";
import CssGradient from "./CssGradient";

export const metadata: Metadata = {
  title: "CSS 그라디언트 생성기",
  description:
    "linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사하세요. 색상 정지점을 드래그로 추가·이동하고 각도와 위치를 조절하며 결과를 실시간으로 미리봅니다. 모든 처리는 브라우저 안에서 이루어집니다.",
  alternates: { canonical: "/css-gradient" },
};

export default function Page() {
  return <CssGradient />;
}
