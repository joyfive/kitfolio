/* ============================================================
   HTML 접근성 검사기: 규칙 카탈로그 (파서에 의존하지 않는 순수 데이터)

   parse5 는 검사 엔진에서만 필요하다. 페이지 첫 로드에 함께 내려가지
   않도록, UI 가 정적으로 참조하는 목록·메타데이터는 여기 따로 둔다.
   (컴포넌트는 analyze 모듈을 검사 시점에 동적으로 import 한다)
   ============================================================ */
import type { FindingCategory, FindingLevel } from "./types";

/** 규칙 메타: 단계·카테고리·관련 WCAG 성공 기준.
 *  WCAG 번호는 설명 링크이지, 이 도구가 성공 기준 전체를 판정한다는 뜻이 아니다. */
export type RuleMeta = {
  level: FindingLevel;
  category: FindingCategory;
  wcag: string[];
  /** 전체 문서 범위에서만 실행 */
  documentOnly?: boolean;
};

export const RULES = {
  "DOC-001": { level: "issue", category: "document", wcag: ["3.1.1"], documentOnly: true },
  "DOC-002": { level: "review", category: "document", wcag: ["3.1.1"], documentOnly: true },
  "DOC-003": { level: "issue", category: "document", wcag: ["2.4.2"], documentOnly: true },
  "DOC-004": { level: "issue", category: "document", wcag: ["1.3.1", "4.1.2"] },
  "DOC-005": { level: "review", category: "document", wcag: ["3.1.1"], documentOnly: true },

  "HEAD-001": { level: "issue", category: "structure", wcag: ["1.3.1", "2.4.6"] },
  "HEAD-002": { level: "review", category: "structure", wcag: ["1.3.1", "2.4.6"] },
  "HEAD-003": { level: "review", category: "structure", wcag: [], documentOnly: true },
  "HEAD-004": { level: "review", category: "structure", wcag: [], documentOnly: true },
  "HEAD-005": { level: "issue", category: "structure", wcag: ["1.3.1", "4.1.2"] },

  "LAND-001": { level: "review", category: "structure", wcag: ["1.3.1", "2.4.1"], documentOnly: true },
  "LAND-002": { level: "review", category: "structure", wcag: ["1.3.1"], documentOnly: true },
  "LAND-003": { level: "review", category: "structure", wcag: ["1.3.1", "2.4.1"] },
  "LAND-004": { level: "review", category: "structure", wcag: ["1.3.1", "4.1.2"] },

  "FORM-001": { level: "issue", category: "name", wcag: ["1.3.1", "3.3.2", "4.1.2"] },
  "FORM-002": { level: "issue", category: "name", wcag: ["1.3.1", "3.3.2"] },
  "FORM-003": { level: "review", category: "name", wcag: ["3.3.2", "4.1.2"] },
  "FORM-004": { level: "review", category: "name", wcag: ["1.3.1", "3.3.2"] },

  "NAME-001": { level: "issue", category: "name", wcag: ["2.4.4", "4.1.2"] },
  "NAME-002": { level: "review", category: "name", wcag: ["2.5.3"] },
  "NAME-003": { level: "issue", category: "name", wcag: ["1.1.1", "4.1.2"] },
  "NAME-004": { level: "review", category: "name", wcag: ["4.1.2"] },

  "IMG-001": { level: "issue", category: "image", wcag: ["1.1.1"] },
  "IMG-002": { level: "review", category: "image", wcag: ["1.1.1"] },
  "IMG-003": { level: "review", category: "image", wcag: ["1.1.1"] },
  "IMG-004": { level: "issue", category: "image", wcag: ["1.1.1", "2.4.4", "4.1.2"] },
  "IMG-005": { level: "issue", category: "image", wcag: ["1.1.1", "4.1.2"] },

  "ARIA-001": { level: "issue", category: "name", wcag: ["1.3.1", "4.1.2"] },
  "ARIA-002": { level: "review", category: "name", wcag: ["4.1.2"] },
  "ARIA-003": { level: "review", category: "name", wcag: ["4.1.2"] },

  "FOCUS-001": { level: "review", category: "focus", wcag: ["2.4.3"] },
  "FOCUS-002": { level: "issue", category: "focus", wcag: ["2.4.3"] },
  "FOCUS-003": { level: "review", category: "focus", wcag: ["2.1.1", "4.1.2"] },
  "FOCUS-004": { level: "review", category: "focus", wcag: ["2.1.1", "2.4.3"] },
} as const satisfies Record<string, RuleMeta>;

export type RuleId = keyof typeof RULES;

/** 고정 수동 검사 목록 (기획서 5.10): 검사 결과와 무관하게 항상 보여준다 */
export const MANUAL_CHECKS = [
  { id: "MANUAL-001", category: "focus" },
  { id: "MANUAL-002", category: "focus" },
  { id: "MANUAL-003", category: "focus" },
  { id: "MANUAL-004", category: "structure" },
  { id: "MANUAL-005", category: "structure" },
  { id: "MANUAL-006", category: "name" },
  { id: "MANUAL-007", category: "image" },
  { id: "MANUAL-008", category: "name" },
] as const satisfies readonly { id: string; category: FindingCategory }[];

/** 입력에 문서 수준 요소가 보이면 전체 문서 검사를 제안한다.
 *  제안일 뿐 선택값을 몰래 바꾸지 않는다 (기획서 4.2). */
export function looksLikeDocument(source: string): boolean {
  return /<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(source);
}
