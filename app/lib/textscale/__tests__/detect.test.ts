/* ============================================================
   문제 후보 감지: 규칙별 감지와 오탐 방지

   snapshot 두 벌만 받는 순수 함수라 브라우저 없이 고정할 수 있다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DOCUMENT_NODE, detectCandidates, summarize } from "../detect";
import type { DocSnapshot, NodeSnapshot, Preset } from "../types";

function node(over: Partial<NodeSnapshot> = {}): NodeSnapshot {
  return {
    id: "n0",
    tag: "div",
    path: "div",
    text: "본문",
    parentId: null,
    hasText: true,
    isControl: false,
    clientWidth: 300,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 100,
    right: 300,
    overflowX: "visible",
    overflowY: "visible",
    whiteSpace: "normal",
    fontSizePx: 16,
    fixedHeight: false,
    ...over,
  };
}

function doc(nodes: NodeSnapshot[], over: Partial<DocSnapshot> = {}): DocSnapshot {
  return { viewport: 320, scrollWidth: 320, clientWidth: 320, nodes, ...over };
}

function rules(preset: Preset, origin: DocSnapshot, test: DocSnapshot): string[] {
  return detectCandidates({ preset, origin, test })
    .flatMap((c) => c.reasons.map((r) => r.ruleId))
    .sort();
}

describe("REFLOW", () => {
  test("REFLOW-001: 문서가 viewport 보다 넓으면 감지한다", () => {
    const found = detectCandidates({
      preset: "reflow-320",
      origin: doc([], { clientWidth: 1280, scrollWidth: 1280 }),
      test: doc([], { scrollWidth: 560, clientWidth: 320 }),
    });
    assert.equal(found[0].nodeId, DOCUMENT_NODE);
    assert.equal(found[0].reasons[0].ruleId, "REFLOW-001");
  });

  test("2px 이하 subpixel 차이는 무시한다", () => {
    assert.deepEqual(
      rules("reflow-320", doc([]), doc([], { scrollWidth: 322, clientWidth: 320 })),
      [],
    );
  });

  test("REFLOW-002: viewport 밖으로 나간 요소를 감지한다", () => {
    assert.ok(
      rules("reflow-320", doc([node()]), doc([node({ right: 560 })])).includes("REFLOW-002"),
    );
  });

  test("REFLOW-002: 내부 가로 스크롤 영역은 SCROLL-001 로만 다룬다", () => {
    const scroller = node({ right: 560, overflowX: "auto", scrollWidth: 800 });
    const found = rules("reflow-320", doc([node()]), doc([scroller]));
    assert.ok(!found.includes("REFLOW-002"));
    assert.ok(found.includes("SCROLL-001"));
  });

  test("리플로 전용 규칙은 다른 프리셋에서 실행되지 않는다", () => {
    const wide = doc([node({ right: 560 })], { scrollWidth: 560 });
    assert.deepEqual(rules("text-200", doc([node()]), wide), []);
  });
});

describe("CLIP", () => {
  test("CLIP-001: 세로로 넘치면서 overflow 가 숨김이면 감지한다", () => {
    const clipped = node({ overflowY: "hidden", scrollHeight: 356, clientHeight: 230 });
    assert.ok(rules("text-200", doc([node()]), doc([clipped])).includes("CLIP-001"));
  });

  test("overflow: visible 이면 넘쳐도 잘림으로 보지 않는다", () => {
    const visible = node({ overflowY: "visible", scrollHeight: 356, clientHeight: 230 });
    assert.deepEqual(rules("text-200", doc([node()]), doc([visible])), []);
  });

  test("텍스트가 없는 순수 장식 요소는 잘림 검사에서 제외한다", () => {
    const decor = node({ hasText: false, overflowY: "hidden", scrollHeight: 400, clientHeight: 100 });
    assert.deepEqual(rules("text-200", doc([node()]), doc([decor])), []);
  });

  test("CLIP-002: 가로 잘림도 같은 방식으로 감지한다", () => {
    const clipped = node({ overflowX: "clip", scrollWidth: 500, clientWidth: 300 });
    assert.ok(rules("text-spacing", doc([node()]), doc([clipped])).includes("CLIP-002"));
  });
});

describe("NOWRAP · CONTROL · FIXED", () => {
  test("NOWRAP-001: 줄바꿈이 막힌 텍스트의 오버플로", () => {
    const nowrap = node({ whiteSpace: "nowrap", scrollWidth: 500, clientWidth: 300 });
    assert.ok(rules("text-200", doc([node()]), doc([nowrap])).includes("NOWRAP-001"));
  });

  test("CONTROL-001: control 안 문구가 상자를 넘는다", () => {
    const button = node({ tag: "button", isControl: true, scrollWidth: 420, clientWidth: 300 });
    assert.ok(rules("text-200", doc([node()]), doc([button])).includes("CONTROL-001"));
  });

  test("FIXED-001: 고정 높이 + 숨김에서 콘텐츠가 늘어난 경우만", () => {
    const before = node({ fixedHeight: true, overflowY: "hidden", scrollHeight: 200 });
    const after = node({ fixedHeight: true, overflowY: "hidden", scrollHeight: 356, clientHeight: 230 });
    assert.ok(rules("text-200", doc([before]), doc([after])).includes("FIXED-001"));
    // 늘어나지 않았으면 FIXED-001 은 나오지 않는다
    assert.ok(!rules("text-200", doc([before]), doc([before])).includes("FIXED-001"));
  });

  test("FIXED-001 은 리플로 프리셋에서 실행되지 않는다", () => {
    const before = node({ fixedHeight: true, overflowY: "hidden", scrollHeight: 200 });
    const after = node({ fixedHeight: true, overflowY: "hidden", scrollHeight: 356 });
    assert.ok(!rules("reflow-320", doc([before]), doc([after])).includes("FIXED-001"));
  });
});

describe("결과 묶기와 원본 구분", () => {
  test("같은 요소의 여러 사유는 카드 하나로 묶는다", () => {
    const bad = node({
      overflowY: "hidden",
      scrollHeight: 400,
      clientHeight: 200,
      whiteSpace: "nowrap",
      scrollWidth: 500,
      clientWidth: 300,
      overflowX: "hidden",
    });
    const found = detectCandidates({ preset: "text-200", origin: doc([node()]), test: doc([bad]) });
    assert.equal(found.length, 1);
    assert.deepEqual(
      found[0].reasons.map((r) => r.ruleId).sort(),
      ["CLIP-001", "CLIP-002", "NOWRAP-001"],
    );
  });

  test("원본에도 있던 문제와 프리셋이 새로 만든 문제를 구분한다", () => {
    const clipped = node({ overflowY: "hidden", scrollHeight: 400, clientHeight: 200 });
    const already = detectCandidates({
      preset: "text-200",
      origin: doc([clipped]),
      test: doc([clipped]),
    });
    assert.equal(already[0].preexisting, true);

    const introduced = detectCandidates({
      preset: "text-200",
      origin: doc([node()]),
      test: doc([clipped]),
    });
    assert.equal(introduced[0].preexisting, false);
  });

  test("요약은 총 개수·새로 생긴 문제·페이지 오버플로를 구분한다", () => {
    const found = detectCandidates({
      preset: "reflow-320",
      origin: doc([node()], { clientWidth: 1280, scrollWidth: 1280 }),
      test: doc([node({ right: 560 })], { scrollWidth: 560, clientWidth: 320 }),
    });
    const s = summarize(found);
    assert.equal(s.pageOverflow, true);
    assert.equal(s.total, 2);
    assert.equal(s.introduced, 2);
  });

  test("후보가 없으면 빈 배열을 돌려준다 (점수·합격률을 만들지 않는다)", () => {
    assert.deepEqual(detectCandidates({ preset: "text-200", origin: doc([node()]), test: doc([node()]) }), []);
  });
});

describe("오버플로 원인 좁히기", () => {
  test("REFLOW-002: 넘치는 부모 안의 자식은 다시 보고하지 않는다", () => {
    // 560px 카드가 320px viewport 를 넘고, 그 안의 문단도 함께 넘는 상황
    const card = node({ id: "card", tag: "section", right: 560 });
    const inner = node({ id: "inner", tag: "p", parentId: "card", right: 535 });
    const found = detectCandidates({
      preset: "reflow-320",
      origin: doc([node({ id: "card" }), node({ id: "inner", parentId: "card" })], {
        clientWidth: 1280,
        scrollWidth: 1280,
      }),
      test: doc([card, inner], { scrollWidth: 560, clientWidth: 320 }),
    });
    const reflowNodes = found
      .filter((c) => c.reasons.some((r) => r.ruleId === "REFLOW-002"))
      .map((c) => c.nodeId);
    assert.deepEqual(reflowNodes, ["card"]);
  });

  test("정상 폭 부모 안의 넓은 자식은 그대로 보고한다", () => {
    const wrap = node({ id: "wrap", right: 300 });
    const wide = node({ id: "wide", parentId: "wrap", right: 700 });
    const found = detectCandidates({
      preset: "reflow-320",
      origin: doc([node({ id: "wrap" }), node({ id: "wide", parentId: "wrap" })]),
      test: doc([wrap, wide], { scrollWidth: 700, clientWidth: 320 }),
    });
    assert.ok(
      found.some((c) => c.nodeId === "wide" && c.reasons.some((r) => r.ruleId === "REFLOW-002")),
    );
  });

  test("자손 텍스트가 있는 컨테이너도 잘림 검사 대상이다", () => {
    // 고정 높이 래퍼가 자식 문단을 잘라내는 것이 이 도구가 찾는 문제다
    const wrapper = node({
      id: "card",
      tag: "section",
      hasText: true,
      overflowY: "hidden",
      clientHeight: 230,
      scrollHeight: 356,
    });
    assert.ok(rules("text-200", doc([node({ id: "card" })]), doc([wrapper])).includes("CLIP-001"));
  });
});
