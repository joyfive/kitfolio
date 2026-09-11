/* ============================================================
   명도대비 계산 · 제안 · 팔레트 파싱 검증

   수치는 다른 검사기 결과를 베껴 비교하지 않고 WCAG 2.2 산식으로 직접 검증한다.
   판정 경계(3 · 4.5 · 7)는 반올림 전 값 기준임을 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  CRITERIA,
  PALETTE_MAX,
  TARGET_RATIO,
  contrastBand,
  contrastRatio,
  formatRatio,
  meets,
  parseHexColor,
  parsePalette,
  relativeLuminance,
  suggestPassingColor,
} from "../contrast.ts";

describe("HEX 파싱", () => {
  test("3자리는 6자리로 확장하고 대문자로 정규화한다", () => {
    assert.deepEqual(parseHexColor("#abc"), { ok: true, hex: "#AABBCC" });
    assert.deepEqual(parseHexColor("abc"), { ok: true, hex: "#AABBCC" });
  });

  test("6자리는 '#' 유무와 대소문자에 관계없이 같은 값이 된다", () => {
    assert.deepEqual(parseHexColor("  0ea5e9 "), { ok: true, hex: "#0EA5E9" });
    assert.deepEqual(parseHexColor("#0EA5E9"), { ok: true, hex: "#0EA5E9" });
  });

  test("알파 HEX(4·8자리)는 지원하지 않는 형식으로 구분한다", () => {
    assert.deepEqual(parseHexColor("#1234"), { ok: false, reason: "alpha" });
    assert.deepEqual(parseHexColor("#0EA5E9FF"), { ok: false, reason: "alpha" });
  });

  test("그 밖의 형식은 invalid, 빈 문자열은 empty", () => {
    assert.deepEqual(parseHexColor("#12345"), { ok: false, reason: "invalid" });
    assert.deepEqual(parseHexColor("rgb(0,0,0)"), { ok: false, reason: "invalid" });
    assert.deepEqual(parseHexColor("   "), { ok: false, reason: "empty" });
  });
});

describe("상대 휘도", () => {
  test("검정 0 · 흰색 1", () => {
    assert.equal(relativeLuminance("#000000"), 0);
    assert.equal(relativeLuminance("#FFFFFF"), 1);
  });

  test("원색 휘도는 WCAG 계수와 일치한다", () => {
    // 255 채널은 선형화 후 1이므로 휘도는 계수 그 자체가 된다.
    assert.ok(Math.abs(relativeLuminance("#FF0000") - 0.2126) < 1e-9);
    assert.ok(Math.abs(relativeLuminance("#00FF00") - 0.7152) < 1e-9);
    assert.ok(Math.abs(relativeLuminance("#0000FF") - 0.0722) < 1e-9);
  });

  test("낮은 채널은 선형 구간(c/12.92) 공식을 쓴다", () => {
    // 10/255 = 0.0392… ≤ 0.04045 → 선형 구간
    const expected = (10 / 255 / 12.92) * (0.2126 + 0.7152 + 0.0722);
    assert.ok(Math.abs(relativeLuminance("#0A0A0A") - expected) < 1e-12);
  });
});

describe("대비 비율", () => {
  test("검정과 흰색은 최대 21:1", () => {
    assert.ok(Math.abs(contrastRatio("#000000", "#FFFFFF") - 21) < 1e-9);
    assert.equal(formatRatio(contrastRatio("#000000", "#FFFFFF")), "21.00");
  });

  test("같은 색끼리는 1:1", () => {
    assert.equal(contrastRatio("#334155", "#334155"), 1);
  });

  test("전경색과 배경색을 바꿔도 값이 같다", () => {
    const a = contrastRatio("#111827", "#FFFFFF");
    const b = contrastRatio("#FFFFFF", "#111827");
    assert.equal(a, b);
  });

  test("휘도 정의로 직접 계산한 값과 일치한다", () => {
    const l1 = relativeLuminance("#FFFFFF");
    const l2 = relativeLuminance("#767676");
    assert.ok(
      Math.abs(contrastRatio("#767676", "#FFFFFF") - (l1 + 0.05) / (l2 + 0.05)) < 1e-12,
    );
  });
});

describe("판정 경계", () => {
  test("반올림 전 값으로 판정한다: 4.499 는 본문 AA 미달", () => {
    assert.equal(meets(4.499, 4.5), false);
    assert.equal(meets(4.5, 4.5), true);
  });

  test("경계에 가까우면 소수점 셋째 자리까지 표시한다", () => {
    assert.equal(formatRatio(4.499), "4.499");
    assert.equal(formatRatio(7.004), "7.004");
    assert.equal(formatRatio(4.62), "4.62");
  });

  test("셀 등급은 충족하는 가장 높은 범주를 돌려준다", () => {
    assert.equal(contrastBand(7), "aaa-body");
    assert.equal(contrastBand(4.5), "aa-body");
    assert.equal(contrastBand(4.499), "aa-large");
    assert.equal(contrastBand(3), "aa-large");
    assert.equal(contrastBand(2.999), "fail");
  });

  test("기준 목록은 WCAG 2.2 임계값을 그대로 쓴다", () => {
    const byId = Object.fromEntries(CRITERIA.map((c) => [c.id, c.min]));
    assert.deepEqual(byId, {
      "body-aa": 4.5,
      "body-aaa": 7,
      "large-aa": 3,
      "large-aaa": 4.5,
      "ui-aa": 3,
    });
  });
});

describe("통과 색상 제안", () => {
  test("제안된 색은 실제로 목표 대비를 통과한다", () => {
    const s = suggestPassingColor("#6486EF", "#FFFFFF", TARGET_RATIO["body-aa"]);
    assert.ok(s, "제안이 있어야 한다");
    assert.ok(meets(s.ratio, 4.5));
    // 최종 HEX 로 다시 계산해도 통과여야 한다 (표시값이 아닌 재검증)
    assert.ok(contrastRatio(s.hex, "#FFFFFF") >= 4.5);
    assert.match(s.hex, /^#[0-9A-F]{6}$/);
  });

  test("색조(hue)는 유지한다", () => {
    const s = suggestPassingColor("#6486EF", "#FFFFFF", TARGET_RATIO["body-aaa"]);
    assert.ok(s);
    // 파랑 계열이 파랑으로 남는지: B 채널이 가장 크다
    const n = parseInt(s.hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const b = n & 255;
    assert.ok(b > r);
  });

  test("이미 통과하는 조합보다 원본에 가까운 쪽을 고른다", () => {
    // 흰 배경에서는 어둡게 가는 쪽이 지각 거리가 훨씬 가깝다.
    const s = suggestPassingColor("#8A8A8A", "#FFFFFF", TARGET_RATIO["body-aa"]);
    assert.ok(s);
    assert.ok(relativeLuminance(s.hex) < relativeLuminance("#8A8A8A"));
  });

  test("한 색만으로 도달할 수 없으면 제안하지 않는다", () => {
    // 중간 회색 배경에서는 어느 방향으로도 7:1 을 만들 수 없다.
    assert.equal(suggestPassingColor("#767676", "#808080", TARGET_RATIO["body-aaa"]), null);
  });

  test("통과하지 못하는 후보는 절대 돌려주지 않는다", () => {
    const pairs: [string, string, number][] = [
      ["#E2E8F0", "#FFFFFF", 3],
      ["#0F172A", "#000000", 4.5],
      ["#C0392B", "#FFFFFF", 7],
    ];
    for (const [adjust, fixed, target] of pairs) {
      const s = suggestPassingColor(adjust, fixed, target);
      if (s) assert.ok(contrastRatio(s.hex, fixed) >= target, `${adjust} vs ${fixed}`);
    }
  });
});

describe("팔레트 파싱", () => {
  test("줄바꿈·공백·쉼표·세미콜론 구분을 모두 받는다", () => {
    const { colors } = parsePalette("#0F172A\n#334155 #64748B, #E2E8F0; #FFFFFF");
    assert.deepEqual(colors, ["#0F172A", "#334155", "#64748B", "#E2E8F0", "#FFFFFF"]);
  });

  test("중복은 첫 등장만 남긴다", () => {
    const { colors } = parsePalette("#fff #FFFFFF #FFF");
    assert.deepEqual(colors, ["#FFFFFF"]);
  });

  test("CSS 변수 선언에서 HEX 만 뽑고 변수명은 제외 수에 넣지 않는다", () => {
    const css = [
      "--primary-500: #0EA5E9;",
      "--primary-700: #0369A1;",
      "--surface: #FFFFFF;",
    ].join("\n");
    const { colors, invalid } = parsePalette(css);
    assert.deepEqual(colors, ["#0EA5E9", "#0369A1", "#FFFFFF"]);
    assert.equal(invalid, 0);
  });

  test("'#' 로 시작하는 잘못된 토큰만 제외 수로 센다", () => {
    const { colors, invalid } = parsePalette("#0F172A #12345 배경색 #GGGGGG #FFFFFF80");
    assert.deepEqual(colors, ["#0F172A"]);
    assert.equal(invalid, 3);
  });

  test("빈 입력은 색상 0개", () => {
    assert.deepEqual(parsePalette("   "), { colors: [], invalid: 0 });
  });

  test("최대 색상 수 상수는 12", () => {
    assert.equal(PALETTE_MAX, 12);
  });
});
