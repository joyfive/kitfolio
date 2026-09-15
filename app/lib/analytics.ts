/* ============================================================
   GA4 커스텀 이벤트 (도구 공통).

   GA4 자체는 layout.tsx 의 <GoogleAnalytics> 가 로드하며 페이지뷰는 자동
   수집된다. 이 모듈은 "도구를 실제로 썼는가"를 보기 위한 커스텀 이벤트만
   담당한다.

   ── 이름 규칙 (2026-09, 이 파일이 최초 정의) ──────────────
   전 도구 공통 접두사 `tool_` + 동사. 도구 구분은 이름이 아니라 `slug`
   파라미터로 한다. 도구가 늘어도 이벤트 이름은 늘지 않는다.

     tool_view      도구 페이지 진입
     tool_input     유효한 입력이 처음 들어옴
     tool_run       주요 실행 액션(CTA)
     tool_result    실행 결과 (성공 건수 포함)
     tool_error     실행 실패
     tool_download  결과 내려받기

   ── 보내지 않는 값 ────────────────────────────────────────
   파일명·이미지 내용·입력 텍스트·Object URL 처럼 사용자 파일이나 입력을
   식별할 수 있는 값은 어떤 파라미터로도 보내지 않는다. 크기 같은 수치는
   버킷(구간)으로 변환해 보낸다.
   ============================================================ */

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

type GtagWindow = Window & {
  gtag?: (command: "event", name: string, params?: AnalyticsParams) => void;
  dataLayer?: unknown[];
};

/**
 * 커스텀 이벤트 전송. GA4 가 없는 환경(개발·차단됨)에서는 조용히 무시한다.
 * 분석이 도구 동작을 막아서는 안 되므로 어떤 예외도 밖으로 던지지 않는다.
 */
export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as GtagWindow;
    const clean: AnalyticsParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) clean[k] = v;
    }
    if (typeof w.gtag === "function") {
      w.gtag("event", name, clean);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: name, ...clean });
    }
  } catch {
    // 분석 실패는 무시한다.
  }
}
