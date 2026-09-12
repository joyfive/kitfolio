/* ============================================================
   검사 오케스트레이션: 예시 HTML 결과 · 범위 게이트 · 보기 데이터 · 한도
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml, looksLikeDocument, manualFindings } from "../analyze";
import { sampleHtml, SAMPLE_SCOPE } from "../sample";
import { LIMITS, AnalysisError } from "../types";

describe("예시 HTML", () => {
  test("기획서가 정의한 9개 문제를 기대한 규칙 ID 와 단계로 찾는다", () => {
    const result = analyzeHtml(sampleHtml("ko"), SAMPLE_SCOPE);
    const auto = result.findings.filter((f) => f.level !== "manual");
    const byRule = new Map(auto.map((f) => [f.ruleId, f.level]));

    assert.deepEqual(
      [...byRule.keys()].sort(),
      [
        "DOC-001", // html 의 lang 누락
        "DOC-003", // 비어 있는 title
        "FOCUS-001", // 양수 tabindex
        "FORM-002", // 존재하지 않는 id 를 가리키는 label[for]
        "FORM-003", // 이름 신호가 placeholder 뿐인 입력 필드
        "HEAD-002", // h1 다음 h3
        "IMG-001", // img 의 alt 누락
        "NAME-001", // 이름 없는 링크
        "NAME-002", // 보이는 문구가 접근 가능한 이름에 없음
      ],
    );
    assert.equal(byRule.get("DOC-001"), "issue");
    assert.equal(byRule.get("IMG-001"), "issue");
    assert.equal(byRule.get("HEAD-002"), "review");
    assert.equal(byRule.get("NAME-002"), "review");
  });

  test("영문 예시도 같은 구조와 같은 문제를 유지한다", () => {
    const ko = analyzeHtml(sampleHtml("ko"), SAMPLE_SCOPE);
    const en = analyzeHtml(sampleHtml("en"), SAMPLE_SCOPE);
    const ids = (r: typeof ko) =>
      r.findings.filter((f) => f.level !== "manual").map((f) => f.ruleId).sort();
    assert.deepEqual(ids(en), ids(ko));
    assert.equal(en.counts.elements, ko.counts.elements);
  });
});

describe("검사 범위", () => {
  test("전체 문서 규칙은 조각 검사에서 실행되지 않는다", () => {
    const fragment = analyzeHtml("<p>hello</p>", "fragment");
    const documentOnly = ["DOC-001", "DOC-002", "DOC-003", "DOC-005", "HEAD-003", "HEAD-004", "LAND-001", "LAND-002"];
    for (const id of documentOnly) {
      assert.ok(
        !fragment.findings.some((f) => f.ruleId === id),
        `${id} 가 조각 검사에 새어 들어감`,
      );
    }
  });

  test("문서 요소가 보이면 전체 문서 검사를 제안한다", () => {
    assert.equal(looksLikeDocument("<!doctype html><html></html>"), true);
    assert.equal(looksLikeDocument("<body><p>a</p></body>"), true);
    assert.equal(looksLikeDocument("<section><p>a</p></section>"), false);
    // 제안 조건일 뿐 범위를 바꾸지 않는다: 판정은 호출자의 scope 인자로만 한다
    assert.equal(analyzeHtml("<!doctype html><html></html>", "fragment").scope, "fragment");
  });
});

describe("결과 보기", () => {
  test("헤딩 트리는 DOM 순서를 유지하고 건너뛴 자리만 표시한다", () => {
    const rows = analyzeHtml("<h1>a</h1><h3>b</h3><h4>c</h4><h2>d</h2>", "fragment").headings;
    assert.deepEqual(
      rows.map((r) => [r.level, r.skipped]),
      [
        [1, false],
        [3, true],
        [4, false],
        [2, false],
      ],
    );
  });

  test("랜드마크는 native 요소와 명시적 role 을 함께 인식한다", () => {
    const rows = analyzeHtml(
      '<html lang="ko"><head><title>T</title></head><body><header>h</header><nav>n</nav><main>m</main><div role="search">s</div><footer>f</footer></body></html>',
      "document",
    ).landmarks;
    assert.deepEqual(
      rows.map((r) => r.role),
      ["banner", "navigation", "main", "search", "contentinfo"],
    );
    assert.equal(rows[3].implicit, false);
  });

  test("섹션 안의 header·footer 는 랜드마크로 세지 않는다", () => {
    const rows = analyzeHtml("<article><header>h</header><footer>f</footer></article>", "fragment").landmarks;
    assert.deepEqual(rows, []);
  });

  test("조각 검사의 최상위 header 는 역할이 불확실하다고 표시한다", () => {
    const rows = analyzeHtml("<header>h</header>", "fragment").landmarks;
    assert.equal(rows[0].role, "banner");
    assert.equal(rows[0].ambiguous, true);
  });

  test("예상 탭 순서: 양수 tabindex 오름차순 → DOM 순서", () => {
    const rows = analyzeHtml(
      '<button>1st dom</button><a href="/a" tabindex="3">t3</a><input tabindex="1"><textarea tabindex="1"></textarea>',
      "fragment",
    ).tabOrder;
    assert.deepEqual(
      rows.map((r) => [r.kind, r.tabindex]),
      [
        ["input[type=text]", 1],
        ["textarea", 1],
        ["a", 3],
        ["button", null],
      ],
    );
  });

  test("disabled·hidden·inert 로 명확히 제외되는 요소는 탭 순서에서 뺀다", () => {
    const rows = analyzeHtml(
      '<button>a</button><button disabled>b</button><button hidden>c</button><div inert><button>d</button></div>',
      "fragment",
    ).tabOrder;
    assert.equal(rows.length, 1);
  });
});

describe("집계와 한도", () => {
  test("script·style·template·noscript 내부는 검사 요소에서 뺀다", () => {
    const plain = analyzeHtml("<div><p>a</p></div>", "fragment").counts.elements;
    const withOpaque = analyzeHtml(
      "<div><p>a</p><template><b><i>x</i></b></template></div>",
      "fragment",
    ).counts.elements;
    // template 컨테이너 1개만 늘고 그 안의 b·i 는 세지 않는다
    assert.equal(withOpaque, plain + 1);
  });

  test("수동 검사 카드는 결과와 무관하게 항상 8개다", () => {
    assert.equal(manualFindings().length, 8);
    const clean = analyzeHtml('<p>문제 없는 문단</p>', "fragment");
    assert.equal(clean.counts.issue, 0);
    assert.equal(clean.counts.manual, 8);
  });

  test("빈 입력·길이 초과·요소 수 초과는 서로 다른 오류로 구분된다", () => {
    assert.throws(() => analyzeHtml("   \n  ", "fragment"), (e: AnalysisError) => e.type === "empty");
    assert.throws(
      () => analyzeHtml("<p>a</p>".padEnd(LIMITS.maxChars + 1, " "), "fragment"),
      (e: AnalysisError) => e.type === "too-long",
    );
    assert.throws(
      () => analyzeHtml("<b></b>".repeat(LIMITS.maxElements + 1), "fragment"),
      (e: AnalysisError) => e.type === "too-many-elements",
    );
  });

  test("파싱 오류가 있어도 접근성 검사를 계속한다", () => {
    const result = analyzeHtml("<div><p>열린 채로 끝난 문서<img src='a.png'>", "fragment");
    assert.ok(result.counts.elements > 0);
    assert.ok(result.findings.some((f) => f.ruleId === "IMG-001"));
  });

  test("파서가 보완한 요소에는 소스 위치를 붙이지 않는다", () => {
    const result = analyzeHtml("<p>a</p>", "document");
    const doc005 = result.findings.find((f) => f.ruleId === "DOC-005");
    assert.ok(doc005);
    assert.equal(doc005.line, undefined);
  });
});
