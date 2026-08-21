/* ============================================================
   페이지 범위 파서: "1-3, 4-7, 8, 9-12" 형태를 파싱합니다.
   PDF 분할·회전·삭제의 범위 입력에서 공유됩니다.

   규칙:
   - 페이지는 1부터 시작
   - 실제 페이지 수를 초과할 수 없음
   - 시작 > 끝 금지
   - 음수/0 차단
   - 잘못된 구분자 안내
   - 중복 범위는 허용하되 경고
   ============================================================ */

export type PageRange = { start: number; end: number };

export type ParseIssueCode =
  | "empty"
  | "invalid-token"
  | "zero-or-negative"
  | "start-after-end"
  | "out-of-bounds"
  | "duplicate";

export type ParseResult = {
  /** 유효 범위 목록 (입력 순서 유지) */
  ranges: PageRange[];
  /** 실행 차단 오류 (있으면 실행 불가) */
  errors: ParseIssueCode[];
  /** 경고 (실행은 가능) */
  warnings: ParseIssueCode[];
};

/** 범위가 1페이지짜리인지 */
export function isSinglePage(r: PageRange): boolean {
  return r.start === r.end;
}

/** 범위를 페이지 인덱스(0-based) 배열로 확장 */
export function rangeToIndices(r: PageRange): number[] {
  const out: number[] = [];
  for (let p = r.start; p <= r.end; p++) out.push(p - 1);
  return out;
}

export function parsePageRanges(input: string, totalPages: number): ParseResult {
  const errors = new Set<ParseIssueCode>();
  const warnings = new Set<ParseIssueCode>();
  const ranges: PageRange[] = [];

  const raw = (input || "").trim();
  if (!raw) {
    return { ranges: [], errors: ["empty"], warnings: [] };
  }

  const tokens = raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seen = new Set<string>();

  for (const token of tokens) {
    // 허용 형태: "N" 또는 "N-M"
    const m = token.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) {
      errors.add("invalid-token");
      continue;
    }
    const start = parseInt(m[1], 10);
    const end = m[2] != null ? parseInt(m[2], 10) : start;

    if (start <= 0 || end <= 0) {
      errors.add("zero-or-negative");
      continue;
    }
    if (start > end) {
      errors.add("start-after-end");
      continue;
    }
    if (start > totalPages || end > totalPages) {
      errors.add("out-of-bounds");
      continue;
    }

    const key = `${start}-${end}`;
    if (seen.has(key)) {
      warnings.add("duplicate");
    }
    seen.add(key);
    ranges.push({ start, end });
  }

  // 겹치는(부분 중복) 범위도 경고
  if (!warnings.has("duplicate") && hasOverlap(ranges)) {
    warnings.add("duplicate");
  }

  return {
    ranges,
    errors: [...errors],
    warnings: [...warnings],
  };
}

function hasOverlap(ranges: PageRange[]): boolean {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= sorted[i - 1].end) return true;
  }
  return false;
}
