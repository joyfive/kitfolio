/* ============================================================
   색각이상 시뮬레이션 변환 검증

   행렬값은 직접 옮겨 적은 표이므로, 같은 Machado 데이터를 싣고 있는
   culori 의 filterDeficiency* 에서 기저색으로 역산한 값과 대조한다.
   픽셀 출력은 공식 산식(선형화 → 행렬 → sRGB 인코딩)을 테스트 안에서
   다시 계산해 채널당 ±1 이내인지 본다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
} from "culori";
import {
  CVD_MATRICES,
  CVD_TYPES,
  MAX_PREVIEW_PIXELS,
  applyView,
  matrixFor,
  previewSize,
  simulateCvd,
  toGrayscale,
  validateImageFile,
  type CvdType,
  type PixelBuffer,
} from "../cvd.ts";

/** culori 필터에 기저색을 통과시켜 3x3 행렬을 역산한다. */
function matrixFromCulori(type: CvdType, strength: number): number[] {
  const make = {
    protan: filterDeficiencyProt,
    deutan: filterDeficiencyDeuter,
    tritan: filterDeficiencyTrit,
  }[type];
  const f = make(strength / 100);
  const cols = [
    f({ mode: "rgb", r: 1, g: 0, b: 0 }),
    f({ mode: "rgb", r: 0, g: 1, b: 0 }),
    f({ mode: "rgb", r: 0, g: 0, b: 1 }),
  ];
  const m: number[] = [];
  for (const ch of ["r", "g", "b"] as const) for (const c of cols) m.push(c[ch] as number);
  return m;
}

function buffer(pixels: number[][]): PixelBuffer {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach((p, i) => data.set(p, i * 4));
  return { data, width: pixels.length, height: 1 };
}

function toLinear(v8: number): number {
  const c = v8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toSrgb8(linear: number): number {
  if (linear <= 0) return 0;
  if (linear >= 1) return 255;
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.round(c * 255);
}

describe("Machado 행렬표", () => {
  test("culori 가 싣고 있는 공식 데이터와 일치한다", () => {
    for (const type of CVD_TYPES) {
      for (let s = 0; s <= 100; s += 10) {
        const ours = matrixFor(type, s);
        const theirs = matrixFromCulori(type, s);
        for (let i = 0; i < 9; i++) {
          assert.ok(
            Math.abs(ours[i] - theirs[i]) < 1e-9,
            `${type} ${s}% [${i}]: ${ours[i]} vs ${theirs[i]}`,
          );
        }
      }
    }
  });

  test("유형마다 0~100% 11단계를 갖는다", () => {
    for (const type of CVD_TYPES) assert.equal(CVD_MATRICES[type].length, 11);
  });

  test("0% 는 항등 행렬이다", () => {
    for (const type of CVD_TYPES) {
      assert.deepEqual([...matrixFor(type, 0)], [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }
  });

  test("10% 단위를 벗어난 강도는 거부한다", () => {
    assert.throws(() => matrixFor("deutan", 110), RangeError);
    assert.throws(() => matrixFor("deutan", -10), RangeError);
  });
});

describe("픽셀 변환", () => {
  const sample = [
    [255, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 128],
    [18, 52, 86, 255],
    [255, 255, 255, 255],
    [0, 0, 0, 0],
  ];

  test("0% 결과는 원본 픽셀과 완전히 같다", () => {
    const src = buffer(sample);
    for (const type of CVD_TYPES) {
      const out = simulateCvd(src, type, 0);
      assert.deepEqual([...out.data], [...src.data]);
    }
  });

  test("공식 산식(선형화 → 행렬 → sRGB)과 채널당 ±1 이내로 일치한다", () => {
    const src = buffer(sample);
    for (const type of CVD_TYPES) {
      for (const strength of [10, 40, 70, 100]) {
        const m = matrixFor(type, strength);
        const out = simulateCvd(src, type, strength);
        for (let i = 0; i < src.data.length; i += 4) {
          const r = toLinear(src.data[i]);
          const g = toLinear(src.data[i + 1]);
          const b = toLinear(src.data[i + 2]);
          const expected = [
            toSrgb8(m[0] * r + m[1] * g + m[2] * b),
            toSrgb8(m[3] * r + m[4] * g + m[5] * b),
            toSrgb8(m[6] * r + m[7] * g + m[8] * b),
          ];
          for (let c = 0; c < 3; c++) {
            assert.ok(
              Math.abs(out.data[i + c] - expected[c]) <= 1,
              `${type} ${strength}% px${i / 4} ch${c}: ${out.data[i + c]} vs ${expected[c]}`,
            );
          }
        }
      }
    }
  });

  test("알파 채널은 변환 전후가 같다", () => {
    const src = buffer(sample);
    for (const view of [...CVD_TYPES, "grayscale" as const]) {
      const out = applyView(src, view, 100);
      for (let i = 3; i < src.data.length; i += 4) {
        assert.equal(out.data[i], src.data[i], `${view} alpha @${i}`);
      }
    }
  });

  test("범위를 벗어난 계산 결과는 0~255로 잘린다", () => {
    // tritan 100% 는 R 계수 합이 1을 넘어 밝은 청록에서 상한을 넘긴다.
    const src = buffer([[0, 255, 255, 255]]);
    const out = simulateCvd(src, "tritan", 100);
    for (let c = 0; c < 3; c++) {
      assert.ok(out.data[c] >= 0 && out.data[c] <= 255);
    }
  });

  test("원본 버퍼를 변경하지 않는다", () => {
    const src = buffer(sample);
    const before = [...src.data];
    simulateCvd(src, "protan", 100);
    toGrayscale(src);
    assert.deepEqual([...src.data], before);
  });
});

describe("흑백 점검", () => {
  test("R=G=B 이고 상대 휘도 기반 값과 ±1 이내로 일치한다", () => {
    const src = buffer([
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
      [200, 120, 40, 255],
    ]);
    const out = toGrayscale(src);
    for (let i = 0; i < src.data.length; i += 4) {
      const y =
        0.2126 * toLinear(src.data[i]) +
        0.7152 * toLinear(src.data[i + 1]) +
        0.0722 * toLinear(src.data[i + 2]);
      const expected = toSrgb8(y);
      assert.equal(out.data[i], out.data[i + 1]);
      assert.equal(out.data[i + 1], out.data[i + 2]);
      assert.ok(Math.abs(out.data[i] - expected) <= 1);
    }
  });

  test("채널 평균이 아니라 휘도를 쓴다: 순수 초록과 순수 파랑이 다르게 나온다", () => {
    const out = toGrayscale(buffer([[0, 255, 0, 255], [0, 0, 255, 255]]));
    // 평균 방식이라면 둘 다 85 로 같아진다.
    assert.notEqual(out.data[0], out.data[4]);
    assert.ok(out.data[0] > out.data[4], "초록이 파랑보다 밝아야 한다");
  });

  test("무채색은 그대로 남는다", () => {
    const out = toGrayscale(buffer([[128, 128, 128, 255]]));
    assert.ok(Math.abs(out.data[0] - 128) <= 1);
  });
});

describe("입력 제약", () => {
  const fakeFile = (type: string, size: number) =>
    ({ type, size, name: "x" }) as File;

  test("지원 형식만 통과한다", () => {
    assert.equal(validateImageFile(fakeFile("image/png", 1000)), null);
    assert.equal(validateImageFile(fakeFile("image/jpeg", 1000)), null);
    assert.equal(validateImageFile(fakeFile("image/webp", 1000)), null);
    assert.equal(validateImageFile(fakeFile("image/svg+xml", 1000)), "type");
    assert.equal(validateImageFile(fakeFile("image/gif", 1000)), "type");
  });

  test("10MB 초과는 크기 오류로 구분한다", () => {
    assert.equal(validateImageFile(fakeFile("image/png", 10 * 1024 * 1024 + 1)), "size");
    assert.equal(validateImageFile(fakeFile("image/png", 10 * 1024 * 1024)), null);
  });

  test("미리보기 크기는 비율을 유지하며 2메가픽셀 이하로 줄인다", () => {
    const small = previewSize(800, 600);
    assert.deepEqual(small, { width: 800, height: 600 });

    const big = previewSize(6000, 4000);
    assert.ok(big.width * big.height <= MAX_PREVIEW_PIXELS);
    const srcRatio = 6000 / 4000;
    assert.ok(Math.abs(big.width / big.height - srcRatio) < 0.01);
  });

  test("아주 가느다란 이미지도 최소 1픽셀을 유지한다", () => {
    const thin = previewSize(40000, 1);
    assert.ok(thin.width >= 1 && thin.height >= 1);
  });
});
