import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_DIMENSION,
  MAX_SCALE,
  clampDimension,
  clampScale,
  isUpscale,
  lockedDimension,
  outputName,
  parseDimension,
  sameRatio,
  scaleDimensions,
  scalePercent,
} from "../resize";

describe("lockedDimension", () => {
  test("원본 비율로 반대쪽 축을 계산한다", () => {
    // 2400 × 1600 (3:2) 에서 width 1200 → height 800
    assert.equal(lockedDimension(1200, 2400, 1600), 800);
    assert.equal(lockedDimension(800, 1600, 2400), 1200);
  });

  test("반올림으로 정수 픽셀을 만든다", () => {
    // 1000 × 667 에서 width 333 → 333 * 667 / 1000 = 222.111
    assert.equal(lockedDimension(333, 1000, 667), 222);
    assert.equal(lockedDimension(334, 1000, 667), 223);
  });

  test("0px 로 사라지지 않게 최소 1px 을 유지한다", () => {
    assert.equal(lockedDimension(1, 4000, 10), 1);
  });

  test("잘못된 입력은 1px", () => {
    assert.equal(lockedDimension(100, 0, 100), 1);
    assert.equal(lockedDimension(0, 100, 100), 1);
  });
});

describe("scaleDimensions · scalePercent", () => {
  test("빠른 선택 배율이 원본 기준 픽셀로 반영된다", () => {
    const cases: [number, number, number][] = [
      [25, 600, 400],
      [50, 1200, 800],
      [75, 1800, 1200],
      [100, 2400, 1600],
      [200, 4800, 3200],
    ];
    for (const [pct, w, h] of cases) {
      assert.deepEqual(scaleDimensions(2400, 1600, pct), { width: w, height: h }, `${pct}%`);
    }
  });

  test("홀수 원본도 정수로 떨어진다", () => {
    assert.deepEqual(scaleDimensions(1001, 667, 50), { width: 501, height: 334 });
  });

  test("width 를 직접 바꾸면 배율을 되돌려 계산한다", () => {
    assert.equal(scalePercent(1200, 2400), 50);
    assert.equal(scalePercent(2400, 2400), 100);
    assert.equal(scalePercent(3600, 2400), 150);
  });

  test("배율은 허용 범위로 고정된다", () => {
    assert.equal(clampScale(0), 1);
    assert.equal(clampScale(-40), 1);
    assert.equal(clampScale(900), MAX_SCALE);
    assert.equal(clampScale(Number.NaN), 100);
  });
});

describe("parseDimension", () => {
  test("양의 정수만 받는다", () => {
    assert.equal(parseDimension("1200"), 1200);
    assert.equal(parseDimension(" 630 "), 630);
    assert.equal(parseDimension("1"), 1);
  });

  test("빈 값·0·음수·소수·비숫자는 거절한다", () => {
    for (const bad of ["", "   ", "0", "-5", "12.5", "1e3", "abc", "12px", "+12"]) {
      assert.equal(parseDimension(bad), null, bad);
    }
  });

  test("입력값은 처리 한계 안으로 고정된다", () => {
    assert.equal(clampDimension(0), 1);
    assert.equal(clampDimension(99999), MAX_DIMENSION);
    assert.equal(clampDimension(1200.6), 1201);
  });
});

describe("확대 판정 · 비율 비교", () => {
  test("한 변이라도 원본보다 크면 확대다", () => {
    assert.equal(isUpscale(2400, 1600, 2400, 1600), false);
    assert.equal(isUpscale(1200, 800, 2400, 1600), false);
    assert.equal(isUpscale(2401, 1600, 2400, 1600), true);
    assert.equal(isUpscale(2400, 1601, 2400, 1600), true);
  });

  test("반올림 오차 1px 은 같은 비율로 본다", () => {
    assert.equal(sameRatio(2400, 1600, 1200, 800), true);
    assert.equal(sameRatio(1000, 667, 333, 222), true);
    assert.equal(sameRatio(1200, 800, 1200, 630), false);
  });
});

describe("outputName", () => {
  test("Resize 는 크기를, Crop 은 cropped 표시를 함께 붙인다", () => {
    assert.equal(outputName("hero.png", "resize", 1200, 630, "webp"), "hero-1200x630.webp");
    assert.equal(
      outputName("profile.jpg", "crop", 1080, 1080, "png"),
      "profile-cropped-1080x1080.png",
    );
  });

  test("JPEG 확장자는 .jpg 로 통일한다", () => {
    assert.equal(outputName("photo.jpeg", "resize", 800, 600, "jpeg"), "photo-800x600.jpg");
  });

  test("경로 구분자가 섞인 파일명도 안전하게 정리한다", () => {
    assert.equal(outputName("a/b:c.png", "resize", 10, 10, "png"), "a-b-c-10x10.png");
  });
});
