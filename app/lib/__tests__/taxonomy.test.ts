/* ============================================================
   허브 분류 테스트: 주제 카테고리(1단) · 작업 태그(2단)

   분류는 해결하는 문제 기준이다. 도구마다 카테고리 1개, 작업 태그 1~3개를 갖고,
   허브에 빈 칩이 생기지 않아야 한다. 배치 근거: docs/plans/taxonomy-recategorization.md
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, TOOLS, toolNames, validateTaxonomy } from "../content.ts";

describe("validateTaxonomy", () => {
  test("모든 도구가 분류 규칙을 통과한다", () => {
    assert.deepEqual(validateTaxonomy(), []);
  });

  test("카테고리는 8개이고 모든 카테고리에 ready 도구가 있다", () => {
    assert.equal(CATEGORIES.length, 8);
    for (const c of CATEGORIES)
      assert.ok(TOOLS.some((t) => t.ready && t.category === c.id), c.id);
  });

  test("판단이 갈린 배치는 기획서 결정대로 유지된다", () => {
    const cat = (slug: string) => TOOLS.find((t) => t.slug === slug)!.category;
    assert.equal(cat("slack-timestamp-converter"), "date-time");
    assert.equal(cat("css-gradient"), "code-web");
    assert.equal(cat("color-contrast-checker"), "accessibility");
    assert.equal(cat("open-graph-preview"), "code-web");
    assert.equal(cat("annual-leave-calculator"), "work-leave");
    assert.equal(cat("severance-pay-calculator"), "pay-tax");
  });
});

describe("toolNames: 페이지 언어 이름이 메인", () => {
  const t = TOOLS.find((x) => x.slug === "pdf-tools")!;
  test("ko 페이지는 국문 메인 · 영문 보조", () => {
    const n = toolNames(t, "ko");
    assert.equal(n.main, t.name.ko);
    assert.equal(n.sub, t.name.en);
    assert.equal(n.subLang, "en");
  });
  test("en 페이지는 영문 메인 · 국문 보조", () => {
    const n = toolNames(t, "en");
    assert.equal(n.main, t.name.en);
    assert.equal(n.sub, t.name.ko);
    assert.equal(n.subLang, "ko");
  });
});
