/* ============================================================
   HTML 접근성 검사기: 결과 데이터 모델

   원칙 (기획서 6.5):
   - 사용자 HTML·텍스트를 번역 딕셔너리에 넣지 않는다.
     규칙명·이유·수정 방향은 KO/EN 고정 문구 키(titleKey/reasonKey/fixKey)로만
     전달하고, 실제 문구는 lib/a11y/messages.ts 가 언어별로 보관한다.
   - Finding 에는 AST node 객체를 담지 않는다 (검사 후 AST 를 놓아줄 수 있어야 함).
   ============================================================ */

/** 검사 범위: 컴포넌트 조각 / 전체 문서 */
export type Scope = "fragment" | "document";

/** 판정 단계: 점수가 아니라 "어느 정도 확신할 수 있는가" */
export type FindingLevel = "issue" | "review" | "manual";

/** 결과 필터 카테고리 */
export type FindingCategory = "document" | "structure" | "name" | "image" | "focus";

export type Finding = {
  ruleId: string;
  level: FindingLevel;
  category: FindingCategory;
  /** 관련 WCAG 성공 기준 번호 (판정이 아니라 설명 링크) */
  wcag: string[];
  titleKey: string;
  reasonKey: string;
  fixKey: string;
  /** 규칙 문구에 끼워 넣을 값 (id·태그명 등 사용자 입력 유래 문자열) */
  vars?: Record<string, string>;
  line?: number;
  column?: number;
  elementPath?: string;
  snippet?: string;
};

/** 헤딩 트리 한 행 */
export type HeadingRow = {
  level: number;
  /** 이름 신호 (비어 있으면 UI 가 "이름 없음"으로 표시) */
  name: string;
  /** 앞 헤딩보다 두 단계 이상 내려감 */
  skipped: boolean;
  /** role="heading" 으로 만든 헤딩 */
  aria: boolean;
  path: string;
  line?: number;
  column?: number;
};

/** 랜드마크 한 행 */
export type LandmarkRow = {
  role: string;
  name: string;
  /** native element 의 암시적 역할 (명시적 role 속성이 아님) */
  implicit: boolean;
  /** 중첩 문맥을 정적으로 확정할 수 없어 역할이 불확실함 (fragment 의 header/footer 등) */
  ambiguous: boolean;
  path: string;
  line?: number;
  column?: number;
};

/** 예상 탭 순서 한 행 */
export type TabRow = {
  order: number;
  /** 요소 유형 표시용 (button · a · input[type=text] …) */
  kind: string;
  name: string;
  /** 명시적 tabindex 값 (없으면 null) */
  tabindex: number | null;
  path: string;
  line?: number;
  column?: number;
};

/** HTML 파싱 참고: 접근성 결과와 분리해 보여준다 */
export type ParseNote = { code: string; line: number; column: number };

export type AnalysisCounts = {
  issue: number;
  review: number;
  manual: number;
  /** 검사에 포함된 요소 수 (script·style·template·noscript 내부 제외) */
  elements: number;
};

export type AnalysisResult = {
  scope: Scope;
  findings: Finding[];
  headings: HeadingRow[];
  landmarks: LandmarkRow[];
  tabOrder: TabRow[];
  parseNotes: ParseNote[];
  counts: AnalysisCounts;
};

/** 검사를 시작하지 못하거나 중단된 이유 */
export type AnalysisErrorType =
  | "empty"
  | "too-long"
  | "too-many-elements"
  | "failed";

export class AnalysisError extends Error {
  type: AnalysisErrorType;
  constructor(type: AnalysisErrorType) {
    super(type);
    this.name = "AnalysisError";
    this.type = type;
  }
}

/** 성능 한도 (기획서 6.4) */
export const LIMITS = {
  /** 입력 상한 */
  maxChars: 500_000,
  /** 요소 상한 */
  maxElements: 20_000,
  /** 코드 조각 최대 길이 */
  snippetChars: 160,
} as const;
