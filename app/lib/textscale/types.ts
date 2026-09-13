/* ============================================================
   텍스트 확대·간격 검사기: 데이터 모델

   원칙 (기획서 9장):
   - 사용자 HTML·CSS·화면 문구·element 경로는 서버로 보내지 않는다.
   - 결과에 DOM node 참조를 담지 않는다. 측정값 snapshot 만 남긴다.
   - 경로는 120자, 텍스트 미리보기는 80자로 자른다.
   ============================================================ */

/** 검사 프리셋: 세 성공 기준을 목적별로 분리한다 (하나의 400% 효과로 합치지 않는다) */
export type Preset = "text-200" | "reflow-320" | "text-spacing";

/** 비교 viewport (CSS px) */
export type Viewport = 320 | 768 | 1280;

export const VIEWPORTS: Viewport[] = [320, 768, 1280];
export const DEFAULT_VIEWPORT: Viewport = 768;
export const DEFAULT_PRESET: Preset = "text-200";

/** 리플로 프리셋은 비교 viewport 선택과 무관하게 고정이다.
 *  320 CSS px 는 시작 viewport 1280 CSS px 에서 400% 확대와 동등한 폭이다.
 *  https://www.w3.org/WAI/WCAG22/Understanding/reflow.html */
export const REFLOW_ORIGIN_VIEWPORT = 1280;
export const REFLOW_TEST_VIEWPORT = 320;

/** 프리셋 <-> 관련 WCAG 성공 기준 */
export const PRESET_CRITERION: Record<Preset, { sc: string; level: "AA" }> = {
  "text-200": { sc: "1.4.4", level: "AA" },
  "reflow-320": { sc: "1.4.10", level: "AA" },
  "text-spacing": { sc: "1.4.12", level: "AA" },
};

/** 입력 유형: 유효한 시작 태그 후보가 없으면 일반 텍스트로 처리한다 */
export type InputKind = "html" | "text" | "jsx";

/** 붙여넣는 소스의 형식. 파싱 경로를 고르는 사용자 선택값이다. */
export type SourceFormat = "html" | "jsx";

export const SOURCE_FORMATS: SourceFormat[] = ["html", "jsx"];
export const DEFAULT_SOURCE_FORMAT: SourceFormat = "html";

/** JSX 의 `items.map(...)` 을 몇 번 그릴 것인가.
 *  목록이 한 줄일 때와 여러 줄일 때의 리플로가 다르므로 1개만 그리면
 *  실제 화면과 어긋난다. 안내 문구도 같은 값을 써야 해서 여기 둔다
 *  (변환 모듈은 파서를 끌어오므로 상수만 쓰는 쪽이 함께 받지 않게 한다). */
export const LIST_REPEAT = 3;

/** 감지 규칙 ID (기획서 7.3) */
export type RuleId =
  | "REFLOW-001"
  | "REFLOW-002"
  | "CLIP-001"
  | "CLIP-002"
  | "NOWRAP-001"
  | "CONTROL-001"
  | "FIXED-001"
  | "SCROLL-001";

/** 한 element 의 측정 snapshot. node 참조는 담지 않는다. */
export type NodeSnapshot = {
  /** 원본·검사 preview 를 대응시키는 내부 전용 id */
  id: string;
  tag: string;
  /** 요소 경로 (최대 120자) */
  path: string;
  /** 결과 카드에 보여줄 텍스트 미리보기 (최대 80자) */
  text: string;
  /** 부모 element 의 id (없으면 null). 오버플로 원인을 가장 바깥 요소 하나로 좁힌다. */
  parentId: string | null;
  /** 자신이나 자손이 텍스트를 제공하는가.
   *  텍스트가 전혀 없는 순수 장식 element 는 잘림 검사에서 제외한다. */
  hasText: boolean;
  /** button·input·select·textarea */
  isControl: boolean;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  /** 문서 기준 오른쪽 경계 (가로 오버플로 판정용) */
  right: number;
  overflowX: string;
  overflowY: string;
  whiteSpace: string;
  fontSizePx: number;
  /** 고정 px height 또는 max-height 가 걸려 있는가 */
  fixedHeight: boolean;
};

/** 한 preview 문서의 측정 결과 */
export type DocSnapshot = {
  /** 내부 viewport (CSS px) */
  viewport: number;
  scrollWidth: number;
  clientWidth: number;
  nodes: NodeSnapshot[];
};

/** 감지된 문제 후보. 같은 element 의 여러 사유는 한 카드로 묶는다. */
export type Candidate = {
  /** NodeSnapshot.id · 문서 전체 규칙은 "document" */
  nodeId: string;
  tag: string;
  path: string;
  text: string;
  reasons: CandidateReason[];
  /** 원본에서도 이미 발생한 문제인가 (프리셋이 새로 만든 문제와 구분) */
  preexisting: boolean;
};

export type CandidateReason = {
  ruleId: RuleId;
  /** 결과 카드에 표시할 측정값 (이미 포맷된 문자열) */
  detail: string;
};

/** 측정 한도 (기획서 8장) */
export const LIMITS = {
  maxHtmlChars: 200_000,
  maxCssChars: 100_000,
  maxElements: 10_000,
  /** subpixel 반올림 오차를 문제로 보지 않기 위한 여유 */
  tolerancePx: 2,
  pathChars: 120,
  textChars: 80,
} as const;

export type PreviewErrorType =
  | "empty"
  | "html-too-long"
  | "css-too-long"
  | "too-many-elements"
  | "parse-failed"
  | "jsx-parse-failed"
  | "jsx-no-element"
  | "render-failed"
  | "unsupported";

export class PreviewError extends Error {
  type: PreviewErrorType;
  constructor(type: PreviewErrorType) {
    super(type);
    this.name = "PreviewError";
    this.type = type;
  }
}
