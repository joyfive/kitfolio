/* ============================================================
   블로그 렌더링 테스트

   핵심은 한국어 강조 보정(fixCjkEmphasis)이다.
   CommonMark 는 닫는 `**` 앞이 문장부호이고 뒤에 글자가 바로 오면 강조로 보지 않아
   `**` 가 화면에 그대로 노출된다. 한국어는 조사가 붙어 이 조건에 자주 걸린다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fixCjkEmphasis, getAllSlugs, getPost } from "../blog.ts";

describe("fixCjkEmphasis: CommonMark 가 놓치는 강조 보정", () => {
  test("문장부호로 끝나고 조사가 붙는 경우 <strong> 으로 바꾼다", () => {
    assert.equal(fixCjkEmphasis("**400%**입니다"), "<strong>400%</strong>입니다");
    assert.equal(
      fixCjkEmphasis("**rem(root em)**은 루트 기준"),
      "<strong>rem(root em)</strong>은 루트 기준",
    );
    assert.equal(fixCjkEmphasis("**+25%**입니다"), "<strong>+25%</strong>입니다");
    assert.equal(fixCjkEmphasis("**px(픽셀)**는"), "<strong>px(픽셀)</strong>는");
  });

  test("숫자가 바로 붙는 경우도 보정한다", () => {
    assert.equal(fixCjkEmphasis("**A.**1번"), "<strong>A.</strong>1번");
  });

  test("CommonMark 가 이미 처리하는 강조는 건드리지 않는다", () => {
    // 앞이 글자 → 정상 파싱되므로 marked 에 그대로 넘긴다
    assert.equal(fixCjkEmphasis("**굵게**입니다"), "**굵게**입니다");
    // 뒤가 공백 / 문장부호 → 정상
    assert.equal(fixCjkEmphasis("**400%** 입니다"), "**400%** 입니다");
    assert.equal(fixCjkEmphasis("**400%**."), "**400%**.");
  });

  test("코드 블록·인라인 코드 안은 보정하지 않는다", () => {
    const fenced = "```\n**400%**입니다\n```";
    assert.equal(fixCjkEmphasis(fenced), fenced);
    const inline = "`**400%**입니다`";
    assert.equal(fixCjkEmphasis(inline), inline);
  });

  test("코드 밖 텍스트는 코드가 섞여 있어도 보정된다", () => {
    assert.equal(
      fixCjkEmphasis("`code` **50%**는 절반"),
      "`code` <strong>50%</strong>는 절반",
    );
  });

  test("여러 강조가 한 줄에 있어도 각각 처리한다", () => {
    assert.equal(
      fixCjkEmphasis("**A%**가 **B)**를"),
      "<strong>A%</strong>가 <strong>B)</strong>를",
    );
  });

  test("강조가 아닌 텍스트를 임의로 묶지 않는다", () => {
    assert.equal(fixCjkEmphasis("2 * 3 * 4 = 24"), "2 * 3 * 4 = 24");
    assert.equal(fixCjkEmphasis("별표 없음"), "별표 없음");
  });
});

describe("발행된 아티클 회귀 검사", () => {
  test("렌더된 HTML 에 리터럴 ** 가 남지 않는다", () => {
    const broken: string[] = [];
    for (const slug of getAllSlugs()) {
      for (const lang of ["ko", "en"] as const) {
        const post = getPost(slug, lang);
        if (post?.html.includes("**")) broken.push(`${slug}.${lang}.md`);
      }
    }
    assert.deepEqual(
      broken,
      [],
      `강조가 파싱되지 않은 글: ${broken.join(", ")}`,
    );
  });

  test("모든 아티클이 본문 HTML 을 생성한다", () => {
    for (const slug of getAllSlugs()) {
      for (const lang of ["ko", "en"] as const) {
        const post = getPost(slug, lang);
        if (!post) continue;
        assert.ok(post.html.trim().length > 0, `${slug}.${lang}: 본문 비어 있음`);
      }
    }
  });
});
