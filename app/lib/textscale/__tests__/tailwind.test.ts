/* ============================================================
   Tailwind 모드: 클래스 후보 → stylesheet

   preview 에 실제로 적용되는 값을 고정한다. 여기서 CSS 가 비면 Tailwind
   화면은 스타일 없는 문서로 측정되어 확대·리플로 결과가 통째로 달라진다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { compileTailwind, definedInCss } from "../tailwind";
import { sampleJsx, sampleTailwindCss } from "../sample";
import { jsxToHtml } from "../jsx";
import { sanitizeHtml } from "../sanitize";

describe("utility 생성", () => {
  test("마크업에 쓰인 클래스만 CSS 로 만든다", async () => {
    const { css } = await compileTailwind(["flex", "w-64", "truncate"], "");
    assert.match(css, /\.flex\s*\{[^}]*display:\s*flex/);
    assert.match(css, /\.w-64/);
    assert.match(css, /\.truncate/);
    // 쓰지 않은 utility 까지 실어 보내지 않는다
    assert.ok(!css.includes(".grid-cols-12"), "사용하지 않은 utility 가 들어갔다");
  });

  test("임의 값과 반응형 변형을 그대로 지원한다", async () => {
    const { css } = await compileTailwind(["h-[230px]", "md:flex-col", "hover:underline"], "");
    assert.match(css, /height:\s*230px/);
    assert.match(css, /@media \(width >= 48rem\)/);
    assert.ok(css.includes("hover"), css.slice(-400));
  });

  test("preflight 를 포함해 실제 Tailwind 프로젝트와 기준선을 맞춘다", async () => {
    const { css } = await compileTailwind(["flex"], "");
    assert.match(css, /box-sizing:\s*border-box/);
  });
});

describe("사용자 CSS 합성", () => {
  test("@theme 토큰으로 만든 utility 가 동작한다", async () => {
    const { css, unknown } = await compileTailwind(["text-brand"], sampleTailwindCss());
    assert.match(css, /--color-brand/);
    assert.match(css, /\.text-brand/);
    assert.deepEqual(unknown, []);
  });

  test("@theme 없이 쓰면 미인식 클래스로 알린다", async () => {
    const { unknown } = await compileTailwind(["text-brand", "flex"], "");
    assert.deepEqual(unknown, ["text-brand"]);
  });

  test("사용자 CSS 가 직접 정의한 클래스는 미인식으로 보지 않는다", async () => {
    const { unknown } = await compileTailwind(
      ["summary-card"],
      ".summary-card { width: 560px; }",
    );
    assert.deepEqual(unknown, []);
    assert.ok(definedInCss("summary-card", ".summary-card { width: 560px; }"));
    assert.ok(!definedInCss("summary", ".summary-card { width: 560px; }"));
  });

  test("변형 표식 클래스는 CSS 가 없는 것이 정상이다", async () => {
    const { unknown } = await compileTailwind(["group", "peer", "group/item"], "");
    assert.deepEqual(unknown, []);
  });

  test("사용자 CSS 의 @import 는 컴파일 전에 사라진다", async () => {
    const { css } = await compileTailwind([], '@import "https://evil.test/a.css";');
    assert.ok(!css.includes("evil.test"), css.slice(0, 200));
  });
});

describe("예시 전체 경로", () => {
  test("JSX 예시의 클래스가 모두 CSS 로 만들어진다", async () => {
    const { html } = jsxToHtml(sampleJsx("ko"));
    const clean = sanitizeHtml(html);
    const { css, unknown } = await compileTailwind(clean.classNames, sampleTailwindCss());

    assert.ok(clean.classNames.includes("w-[560px]"));
    assert.deepEqual(unknown, []);
    assert.match(css, /width:\s*560px/);
    assert.match(css, /height:\s*230px/);
    assert.match(css, /white-space:\s*nowrap/);
  });
});
