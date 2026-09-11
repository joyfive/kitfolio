/* ============================================================
   HTML 접근성 검사기: 검사 오케스트레이션

   analyzeHtml(source, scope) 하나가 진입점이다.
   파싱 → 인덱스 구축 → 이름 문맥 → 헤딩·랜드마크 수집 → 규칙 실행 →
   정렬·집계 순서로 진행하고, AST 는 이 함수 밖으로 나가지 않는다.
   (Finding 에는 node 참조가 없다: 결과만 남기고 트리는 놓아준다)
   ============================================================ */
import { parseHtml } from "./ast";
import { buildNameContext } from "./name";
import { tabOrder } from "./focus";
import { collectHeadings, collectLandmarks, headingRows, landmarkRows } from "./structure";
import { evaluate } from "./rules";
import { MANUAL_CHECKS, RULES, type RuleId, type RuleMeta } from "./catalog";
import {
  AnalysisError,
  LIMITS,
  type AnalysisResult,
  type Finding,
  type FindingLevel,
  type Scope,
} from "./types";

const LEVEL_ORDER: Record<FindingLevel, number> = { issue: 0, review: 1, manual: 2 };

/** 고정 수동 검사 카드: 검사 결과와 무관하게 항상 같은 8개 */
export function manualFindings(): Finding[] {
  return MANUAL_CHECKS.map(({ id, category }) => ({
    ruleId: id,
    level: "manual" as const,
    category,
    wcag: [],
    titleKey: `a11y.rule.${id}.title`,
    reasonKey: `a11y.rule.${id}.reason`,
    fixKey: `a11y.rule.${id}.fix`,
  }));
}

/**
 * 붙여넣은 HTML 을 정적으로 검사한다.
 *
 * @throws AnalysisError 입력이 비었거나 길이·요소 수 상한을 넘으면
 */
export function analyzeHtml(source: string, scope: Scope): AnalysisResult {
  if (source.trim() === "") throw new AnalysisError("empty");
  if (source.length > LIMITS.maxChars) throw new AnalysisError("too-long");

  const ast = parseHtml(source, scope);
  if (ast.elements.length > LIMITS.maxElements) {
    throw new AnalysisError("too-many-elements");
  }

  const ctx = buildNameContext(ast);
  const headings = collectHeadings(ast.elements, ctx);
  const landmarks = collectLandmarks(ast.elements, ctx, scope);

  const found = evaluate({ ast, ctx, scope, headings, landmarks }).filter((f) => {
    // 전체 문서 전용 규칙이 조각 검사에 새어 들어가지 않게 한 번 더 거른다
    const meta: RuleMeta | undefined = RULES[f.ruleId as RuleId];
    return !(meta?.documentOnly && scope !== "document");
  });

  const sorted = [...found, ...manualFindings()].sort((a, b) => {
    const byLevel = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    if (byLevel !== 0) return byLevel;
    const byLine = (a.line ?? Number.MAX_SAFE_INTEGER) - (b.line ?? Number.MAX_SAFE_INTEGER);
    if (byLine !== 0) return byLine;
    const byCol = (a.column ?? 0) - (b.column ?? 0);
    if (byCol !== 0) return byCol;
    return a.ruleId.localeCompare(b.ruleId);
  });

  return {
    scope,
    findings: sorted,
    headings: headingRows(headings),
    landmarks: landmarkRows(landmarks),
    tabOrder: tabOrder(ast.elements, ctx),
    parseNotes: ast.parseNotes,
    counts: {
      issue: sorted.filter((f) => f.level === "issue").length,
      review: sorted.filter((f) => f.level === "review").length,
      manual: sorted.filter((f) => f.level === "manual").length,
      elements: ast.elements.length,
    },
  };
}

/* 파서에 의존하지 않는 제안 판정은 catalog 에 있다 (UI 가 엔진 없이 쓴다) */
export { looksLikeDocument } from "./catalog";
