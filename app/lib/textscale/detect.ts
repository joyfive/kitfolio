/* ============================================================
   텍스트 확대·간격 검사기: 문제 후보 감지 (기획서 7.3 · 7.4)

   자동 측정은 사용자가 preview 에서 볼 위치를 좁혀 주는 보조 기능이다.
   합격률이나 점수를 만들지 않고, 후보와 직접 확인 항목을 나눠 보여준다.

   순수 함수로 둔다: snapshot 두 벌(원본·검사)과 프리셋만 받아 후보를 만든다.
   덕분에 브라우저 없이 테스트할 수 있다.
   ============================================================ */
import {
  LIMITS,
  type Candidate,
  type CandidateReason,
  type DocSnapshot,
  type NodeSnapshot,
  type Preset,
  type RuleId,
} from "./types";

/** 규칙이 실행되는 프리셋 (기획서 7.3) */
export const RULE_PRESETS: Record<RuleId, Preset[] | "all"> = {
  "REFLOW-001": ["reflow-320"],
  "REFLOW-002": ["reflow-320"],
  "CLIP-001": "all",
  "CLIP-002": "all",
  "NOWRAP-001": "all",
  "CONTROL-001": ["text-200", "text-spacing"],
  "FIXED-001": ["text-200", "text-spacing"],
  "SCROLL-001": ["reflow-320"],
};

function runsIn(rule: RuleId, preset: Preset): boolean {
  const presets = RULE_PRESETS[rule];
  return presets === "all" || presets.includes(preset);
}

/** overflow 가 내용을 잘라내는 값인가 */
function clips(value: string): boolean {
  return value === "hidden" || value === "clip";
}

/** overflow 가 스크롤 컨테이너를 만드는 값인가 */
function scrolls(value: string): boolean {
  return value === "auto" || value === "scroll";
}

const T = LIMITS.tolerancePx;

/** 문서 전체 규칙의 결과가 붙는 가상 노드 id */
export const DOCUMENT_NODE = "document";

export type DetectInput = {
  preset: Preset;
  origin: DocSnapshot;
  test: DocSnapshot;
};

/**
 * 원본·검사 snapshot 을 비교해 문제 후보를 만든다.
 *
 * 같은 element 에 여러 규칙이 걸리면 카드 하나로 묶고 사유를 여러 개 붙인다.
 * 원본에서도 이미 나타나던 문제는 preexisting 으로 표시해, 프리셋이 새로
 * 만든 문제와 구분할 수 있게 한다.
 */
export function detectCandidates({ preset, origin, test }: DetectInput): Candidate[] {
  const originById = new Map(origin.nodes.map((n) => [n.id, n]));
  const testById = new Map(test.nodes.map((n) => [n.id, n]));
  const byNode = new Map<string, Candidate>();

  /** 조상 중에도 viewport 를 넘는 요소가 있는가.
   *  넘치는 카드 안의 문단·버튼까지 전부 보고하면 원인 하나에 카드가 여러 개 생긴다.
   *  가장 바깥 요소만 남겨 수정할 위치를 하나로 좁힌다. */
  const overflowsViewport = (n: NodeSnapshot) => n.right > test.clientWidth + T;
  const ancestorOverflows = (n: NodeSnapshot): boolean => {
    let parent = n.parentId ? testById.get(n.parentId) : undefined;
    while (parent) {
      if (overflowsViewport(parent)) return true;
      parent = parent.parentId ? testById.get(parent.parentId) : undefined;
    }
    return false;
  };

  const add = (
    node: NodeSnapshot | null,
    reason: CandidateReason,
    preexisting: boolean,
  ) => {
    const nodeId = node?.id ?? DOCUMENT_NODE;
    const existing = byNode.get(nodeId);
    if (existing) {
      existing.reasons.push(reason);
      // 하나라도 프리셋이 새로 만든 문제라면 새 문제로 본다
      existing.preexisting = existing.preexisting && preexisting;
      return;
    }
    byNode.set(nodeId, {
      nodeId,
      tag: node?.tag ?? "document",
      path: node?.path ?? "document",
      text: node?.text ?? "",
      reasons: [reason],
      preexisting,
    });
  };

  /* REFLOW-001: 문서 자체가 검사 viewport 보다 넓다 */
  if (runsIn("REFLOW-001", preset) && test.scrollWidth > test.clientWidth + T) {
    add(
      null,
      {
        ruleId: "REFLOW-001",
        detail: `scrollWidth ${test.scrollWidth}px · clientWidth ${test.clientWidth}px`,
      },
      origin.scrollWidth > origin.clientWidth + T,
    );
  }

  for (const node of test.nodes) {
    const before = originById.get(node.id);

    /* REFLOW-002: 개별 요소가 viewport 밖으로 밀려났다.
       의도된 내부 scroll container 안의 요소는 SCROLL-001 이 따로 다룬다. */
    if (
      runsIn("REFLOW-002", preset) &&
      overflowsViewport(node) &&
      !scrolls(node.overflowX) &&
      !ancestorOverflows(node)
    ) {
      add(
        node,
        {
          ruleId: "REFLOW-002",
          detail: `오른쪽 경계 ${node.right}px · viewport ${test.clientWidth}px`,
        },
        Boolean(before && before.right > origin.clientWidth + T),
      );
    }

    /* SCROLL-001: 개별 영역이 가로로 스크롤된다. 표·지도라면 허용되는 예외일 수 있다. */
    if (
      runsIn("SCROLL-001", preset) &&
      scrolls(node.overflowX) &&
      node.scrollWidth > node.clientWidth + T
    ) {
      add(
        node,
        {
          ruleId: "SCROLL-001",
          detail: `scrollWidth ${node.scrollWidth}px · clientWidth ${node.clientWidth}px`,
        },
        Boolean(before && before.scrollWidth > before.clientWidth + T),
      );
    }

    // 텍스트가 없는 순수 장식 요소는 잘림 검사에서 제외한다 (오탐 방지)
    if (!node.hasText) continue;

    /* CLIP-001: 세로로 넘치는데 overflow-y 가 숨김·잘라내기 */
    if (
      runsIn("CLIP-001", preset) &&
      clips(node.overflowY) &&
      node.scrollHeight > node.clientHeight + T
    ) {
      add(
        node,
        {
          ruleId: "CLIP-001",
          detail: `clientHeight ${node.clientHeight}px · scrollHeight ${node.scrollHeight}px · overflow-y: ${node.overflowY}`,
        },
        Boolean(before && clips(before.overflowY) && before.scrollHeight > before.clientHeight + T),
      );
    }

    /* CLIP-002: 가로로 넘치는데 overflow-x 가 숨김·잘라내기 */
    if (
      runsIn("CLIP-002", preset) &&
      clips(node.overflowX) &&
      node.scrollWidth > node.clientWidth + T
    ) {
      add(
        node,
        {
          ruleId: "CLIP-002",
          detail: `clientWidth ${node.clientWidth}px · scrollWidth ${node.scrollWidth}px · overflow-x: ${node.overflowX}`,
        },
        Boolean(before && clips(before.overflowX) && before.scrollWidth > before.clientWidth + T),
      );
    }

    /* NOWRAP-001: 줄바꿈을 막아 둔 텍스트가 가로로 넘친다 */
    if (
      runsIn("NOWRAP-001", preset) &&
      (node.whiteSpace === "nowrap" || node.whiteSpace === "pre") &&
      node.scrollWidth > node.clientWidth + T
    ) {
      add(
        node,
        {
          ruleId: "NOWRAP-001",
          detail: `white-space: ${node.whiteSpace} · scrollWidth ${node.scrollWidth}px · clientWidth ${node.clientWidth}px`,
        },
        Boolean(before && before.scrollWidth > before.clientWidth + T),
      );
    }

    /* CONTROL-001: control 안의 문구가 client box 를 넘는다 */
    if (
      runsIn("CONTROL-001", preset) &&
      node.isControl &&
      (node.scrollWidth > node.clientWidth + T || node.scrollHeight > node.clientHeight + T)
    ) {
      add(
        node,
        {
          ruleId: "CONTROL-001",
          detail: `${node.tag} · ${node.clientWidth}x${node.clientHeight}px 안에 ${node.scrollWidth}x${node.scrollHeight}px`,
        },
        Boolean(
          before &&
            (before.scrollWidth > before.clientWidth + T ||
              before.scrollHeight > before.clientHeight + T),
        ),
      );
    }

    /* FIXED-001: 텍스트가 늘어났는데 고정 높이 + 숨김 조합이 걸려 있다 */
    if (
      runsIn("FIXED-001", preset) &&
      node.fixedHeight &&
      clips(node.overflowY) &&
      before &&
      node.scrollHeight > before.scrollHeight + T
    ) {
      add(
        node,
        {
          ruleId: "FIXED-001",
          detail: `고정 높이 ${node.clientHeight}px · 콘텐츠 ${before.scrollHeight}px → ${node.scrollHeight}px`,
        },
        false, // 정의상 프리셋 적용 후에만 발생한다
      );
    }
  }

  // 문서 전체 규칙을 맨 앞에 두고, 나머지는 측정 순서(=DOM 순서)를 유지한다
  const list = [...byNode.values()];
  return list.sort((a, b) => {
    if (a.nodeId === DOCUMENT_NODE) return -1;
    if (b.nodeId === DOCUMENT_NODE) return 1;
    return 0;
  });
}

/** 요약에 쓰는 집계 */
export function summarize(candidates: Candidate[]) {
  return {
    total: candidates.length,
    /** 프리셋이 새로 만든 문제 */
    introduced: candidates.filter((c) => !c.preexisting).length,
    pageOverflow: candidates.some((c) =>
      c.reasons.some((r) => r.ruleId === "REFLOW-001"),
    ),
  };
}
