import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  baseName,
  dedupeNames,
  detectFormat,
  fileSizeBucket,
  formatBytes,
  formatPercent,
  outputFileName,
  savings,
  supportsAlpha,
  supportsQuality,
} from "../imageFormats";
import { withinPixelLimits, IMAGE_LIMITS } from "../imageLimits";

describe("detectFormat", () => {
  test("MIME 타입으로 판별한다", () => {
    assert.equal(detectFormat({ name: "a.bin", type: "image/png" }), "png");
    assert.equal(detectFormat({ name: "a.bin", type: "image/jpeg" }), "jpeg");
    assert.equal(detectFormat({ name: "a.bin", type: "image/webp" }), "webp");
  });

  test("MIME 이 비면 확장자로 판별한다", () => {
    assert.equal(detectFormat({ name: "hero.PNG", type: "" }), "png");
    assert.equal(detectFormat({ name: "hero.jpeg", type: "" }), "jpeg");
    assert.equal(detectFormat({ name: "hero.jpg", type: "" }), "jpeg");
    assert.equal(detectFormat({ name: "hero.webp", type: "" }), "webp");
  });

  test("지원하지 않는 형식은 null", () => {
    assert.equal(detectFormat({ name: "a.gif", type: "image/gif" }), null);
    assert.equal(detectFormat({ name: "a.svg", type: "image/svg+xml" }), null);
    assert.equal(detectFormat({ name: "a.pdf", type: "application/pdf" }), null);
    assert.equal(detectFormat({ name: "noext", type: "" }), null);
  });
});

describe("포맷 성질", () => {
  test("PNG 만 품질 조절이 없다", () => {
    assert.equal(supportsQuality("png"), false);
    assert.equal(supportsQuality("jpeg"), true);
    assert.equal(supportsQuality("webp"), true);
  });

  test("JPG 만 알파를 지원하지 않는다", () => {
    assert.equal(supportsAlpha("jpeg"), false);
    assert.equal(supportsAlpha("png"), true);
    assert.equal(supportsAlpha("webp"), true);
  });
});

describe("outputFileName", () => {
  test("포맷이 바뀌면 확장자만 바꾼다", () => {
    assert.equal(outputFileName("hero.png", "png", "webp"), "hero.webp");
    assert.equal(outputFileName("photo.jpeg", "jpeg", "webp"), "photo.webp");
    assert.equal(outputFileName("icon.webp", "webp", "png"), "icon.png");
  });

  test("같은 포맷으로 재저장하면 -optimized 를 붙인다", () => {
    assert.equal(outputFileName("hero.jpg", "jpeg", "jpeg"), "hero-optimized.jpg");
    assert.equal(outputFileName("hero.jpeg", "jpeg", "jpeg"), "hero-optimized.jpg");
    assert.equal(outputFileName("card.png", "png", "png"), "card-optimized.png");
    assert.equal(outputFileName("card.webp", "webp", "webp"), "card-optimized.webp");
  });

  test("점이 여러 개면 마지막 이미지 확장자만 떼어낸다", () => {
    assert.equal(outputFileName("hero.v2.final.png", "png", "webp"), "hero.v2.final.webp");
  });

  test("경로 구분자는 제거하고 빈 이름은 대체한다", () => {
    assert.equal(outputFileName("a/b:c.png", "png", "webp"), "a-b-c.webp");
    assert.equal(baseName(".png"), "image");
    assert.equal(outputFileName(".png", "png", "webp"), "image.webp");
  });
});

describe("dedupeNames", () => {
  test("같은 이름에 번호를 붙인다", () => {
    assert.deepEqual(dedupeNames(["a.webp", "b.webp", "a.webp", "a.webp"]), [
      "a.webp",
      "b.webp",
      "a-2.webp",
      "a-3.webp",
    ]);
  });

  test("대소문자가 달라도 같은 이름으로 본다 (파일시스템 충돌 방지)", () => {
    assert.deepEqual(dedupeNames(["Hero.webp", "hero.webp"]), ["Hero.webp", "hero-2.webp"]);
  });

  test("중복이 없으면 그대로 둔다", () => {
    assert.deepEqual(dedupeNames(["a.webp", "b.webp"]), ["a.webp", "b.webp"]);
  });
});

describe("savings", () => {
  test("작아지면 절감량과 절감률", () => {
    const s = savings(1_000_000, 250_000);
    assert.equal(s.larger, false);
    assert.equal(s.saved, 750_000);
    assert.equal(s.percent, 75);
  });

  test("커지면 음수가 아니라 larger 로 구분한다", () => {
    const s = savings(82_000, 104_000);
    assert.equal(s.larger, true);
    assert.equal(s.saved, 22_000);
    assert.ok(s.percent > 0, "변화율은 항상 양수로 표기한다");
  });

  test("동일 용량이면 절감 0", () => {
    const s = savings(1000, 1000);
    assert.equal(s.larger, false);
    assert.equal(s.saved, 0);
    assert.equal(s.percent, 0);
  });

  test("원본이 0바이트여도 나누기 오류가 없다", () => {
    const s = savings(0, 100);
    assert.equal(s.percent, 0);
    assert.equal(s.larger, true);
  });
});

describe("formatBytes", () => {
  test("구간별 단위", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(219_136), "214 KB");
    assert.equal(formatBytes(1.84 * 1024 * 1024), "1.84 MB");
  });

  test("100MB 이상은 소수점을 버린다", () => {
    assert.equal(formatBytes(150 * 1024 * 1024), "150 MB");
  });

  test("잘못된 값은 0 B", () => {
    assert.equal(formatBytes(Number.NaN), "0 B");
    assert.equal(formatBytes(-1), "0 B");
  });
});

describe("formatPercent", () => {
  test("소수 첫째 자리까지", () => {
    assert.equal(formatPercent(88.437), "88.4%");
    assert.equal(formatPercent(100), "100.0%");
  });
});

describe("fileSizeBucket", () => {
  test("실제 용량 대신 구간을 돌려준다", () => {
    assert.equal(fileSizeBucket(50 * 1024), "lt_100kb");
    assert.equal(fileSizeBucket(500 * 1024), "lt_1mb");
    assert.equal(fileSizeBucket(3 * 1024 * 1024), "lt_5mb");
    assert.equal(fileSizeBucket(10 * 1024 * 1024), "lt_20mb");
    assert.equal(fileSizeBucket(40 * 1024 * 1024), "gte_20mb");
  });
});

describe("withinPixelLimits", () => {
  test("일반적인 웹 이미지 크기는 통과한다", () => {
    assert.equal(withinPixelLimits(1920, 1080), true);
    assert.equal(withinPixelLimits(1200, 630), true);
  });

  test("한 변이 상한을 넘으면 거부한다", () => {
    assert.equal(withinPixelLimits(IMAGE_LIMITS.maxSide, 10), true);
    assert.equal(withinPixelLimits(IMAGE_LIMITS.maxSide + 1, 10), false);
    assert.equal(withinPixelLimits(10, IMAGE_LIMITS.maxSide + 1), false);
  });

  test("한 변 상한은 WebP 가 표현 가능한 최대치다", () => {
    // Chromium 실측: 16384px 를 넘긴 캔버스는 오류 없이 16383px 로 잘린 WebP 가 된다.
    // 그 조용한 잘림이 "픽셀 크기 유지" 약속을 깨므로 입력 단계에서 막는다.
    assert.equal(IMAGE_LIMITS.maxSide, 16383);
    assert.equal(withinPixelLimits(16384, 100), false);
  });

  test("총 픽셀 수가 상한을 넘으면 거부한다", () => {
    const side = IMAGE_LIMITS.maxSide;
    assert.ok(side * side > IMAGE_LIMITS.maxPixels, "테스트 전제: 정사각 최대 변은 픽셀 상한을 넘는다");
    assert.equal(withinPixelLimits(side, side), false);
  });

  test("0 이하 크기는 거부한다", () => {
    assert.equal(withinPixelLimits(0, 100), false);
    assert.equal(withinPixelLimits(100, 0), false);
  });
});
