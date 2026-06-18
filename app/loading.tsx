import { LogoMark } from "./components/Logo";

/** 라우트 세그먼트 로딩 중 표시되는 공통 폴백. 브랜드 심볼 + 펄스 애니메이션. */
export default function Loading() {
  return (
    <div className="kf-loading" role="status" aria-label="Loading">
      <LogoMark className="kf-loading-mark" title="Kitfolio" />
    </div>
  );
}
