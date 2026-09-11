/* ============================================================
   프리셋 계산: WCAG 기준값과 "줄이지 않는다" 규칙
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  SPACING_RATIO,
  doubledFontSize,
  pxOf,
  spacingOverride,
  viewportsFor,
} from "../presets";

describe("WCAG 1.4.12 기준값", () => {
  test("줄 높이 1.5 · 문단 뒤 2 · 글자 0.12 · 단어 0.16 배", () => {
    // https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
    assert.deepEqual(SPACING_RATIO, {
      lineHeight: 1.5,
      paragraphSpacing: 2,
      letterSpacing: 0.12,
      wordSpacing: 0.16,
    });
  });
});

describe("텍스트 200%", () => {
  test("계산된 글자 크기를 정확히 두 배로 만든다", () => {
    assert.equal(doubledFontSize(16), 32);
    assert.equal(doubledFontSize(13.5), 27);
  });

  test("px 파싱은 normal 같은 비수치를 null 로 돌려준다", () => {
    assert.equal(pxOf("16px"), 16);
    assert.equal(pxOf("normal"), null);
  });
});

describe("텍스트 간격 override", () => {
  const base = {
    fontSizePx: 16,
    lineHeight: "normal",
    letterSpacing: "normal",
    wordSpacing: "normal",
    marginBottom: "0px",
  };

  test("normal 은 0 으로 보고 기준값을 적용한다", () => {
    const out = spacingOverride(base, false);
    assert.equal(out.lineHeight, "24px"); // 16 * 1.5
    assert.equal(out.letterSpacing, "1.92px"); // 16 * 0.12
    assert.equal(out.wordSpacing, "2.56px"); // 16 * 0.16
  });

  test("p 요소에만 문단 뒤 간격을 적용한다", () => {
    assert.equal(spacingOverride(base, true).marginBottom, "32px"); // 16 * 2
    assert.equal(spacingOverride(base, false).marginBottom, null);
  });

  test("기존 값이 기준보다 크면 줄이지 않는다", () => {
    const roomy = {
      fontSizePx: 16,
      lineHeight: "40px",
      letterSpacing: "5px",
      wordSpacing: "8px",
      marginBottom: "60px",
    };
    const out = spacingOverride(roomy, true);
    assert.equal(out.lineHeight, "40px");
    assert.equal(out.letterSpacing, "5px");
    assert.equal(out.wordSpacing, "8px");
    assert.equal(out.marginBottom, "60px");
  });

  test("기존 값이 기준보다 작으면 기준값으로 올린다", () => {
    const tight = {
      fontSizePx: 20,
      lineHeight: "20px",
      letterSpacing: "0px",
      wordSpacing: "1px",
      marginBottom: "4px",
    };
    const out = spacingOverride(tight, true);
    assert.equal(out.lineHeight, "30px");
    assert.equal(out.letterSpacing, "2.4px");
    assert.equal(out.wordSpacing, "3.2px");
    assert.equal(out.marginBottom, "40px");
  });
});

describe("프리셋별 내부 viewport", () => {
  test("리플로는 선택값과 무관하게 1280 -> 320 이다", () => {
    // 320 CSS px 는 1280 CSS px 시작 viewport 에서 400% 확대와 동등하다
    assert.deepEqual(viewportsFor("reflow-320", 768), { origin: 1280, test: 320 });
    assert.deepEqual(viewportsFor("reflow-320", 320), { origin: 1280, test: 320 });
  });

  test("나머지 프리셋은 원본·검사가 같은 viewport 를 쓴다", () => {
    assert.deepEqual(viewportsFor("text-200", 768), { origin: 768, test: 768 });
    assert.deepEqual(viewportsFor("text-spacing", 1280), { origin: 1280, test: 1280 });
  });
});
