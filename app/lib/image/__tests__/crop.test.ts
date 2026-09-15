import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MIN_CROP,
  clampRect,
  fitRatio,
  initialCrop,
  moveRect,
  nudgeSize,
  ratioLabel,
  ratioValue,
  resizeRect,
  toPercent,
  type Rect,
} from "../crop";

const IMG_W = 2400;
const IMG_H = 1600;

/** 사각형이 이미지 안에 완전히 들어가고 정수 픽셀인가 */
function assertInside(r: Rect, w = IMG_W, h = IMG_H) {
  for (const v of [r.x, r.y, r.w, r.h]) assert.ok(Number.isInteger(v), `정수가 아님: ${v}`);
  assert.ok(r.x >= 0 && r.y >= 0, `음수 좌표: ${JSON.stringify(r)}`);
  assert.ok(r.w >= 1 && r.h >= 1, `0px 영역: ${JSON.stringify(r)}`);
  assert.ok(r.x + r.w <= w, `오른쪽 경계 초과: ${JSON.stringify(r)}`);
  assert.ok(r.y + r.h <= h, `아래쪽 경계 초과: ${JSON.stringify(r)}`);
}

describe("ratioValue", () => {
  test("프리셋 비율값", () => {
    assert.equal(ratioValue("free"), null);
    assert.equal(ratioValue("1:1"), 1);
    assert.equal(ratioValue("4:3"), 4 / 3);
    assert.equal(ratioValue("3:2"), 1.5);
    assert.equal(ratioValue("16:9"), 16 / 9);
    assert.equal(ratioValue("9:16"), 9 / 16);
  });
});

describe("clampRect", () => {
  test("업로드 직후에는 이미지 전체가 선택된다", () => {
    assert.deepEqual(initialCrop(IMG_W, IMG_H), { x: 0, y: 0, w: IMG_W, h: IMG_H });
  });

  test("경계를 넘는 영역을 안으로 밀어 넣는다", () => {
    assertInside(clampRect({ x: -200, y: -50, w: 800, h: 600 }, IMG_W, IMG_H));
    assert.deepEqual(clampRect({ x: -200, y: -50, w: 800, h: 600 }, IMG_W, IMG_H), {
      x: 0,
      y: 0,
      w: 800,
      h: 600,
    });
    assert.deepEqual(clampRect({ x: 2300, y: 1500, w: 800, h: 600 }, IMG_W, IMG_H), {
      x: 1600,
      y: 1000,
      w: 800,
      h: 600,
    });
  });

  test("이미지보다 큰 영역은 이미지 크기로 줄어든다", () => {
    assert.deepEqual(clampRect({ x: 0, y: 0, w: 9999, h: 9999 }, IMG_W, IMG_H), {
      x: 0,
      y: 0,
      w: IMG_W,
      h: IMG_H,
    });
  });

  test("조작할 수 없는 0px 영역을 만들지 않는다", () => {
    const r = clampRect({ x: 100, y: 100, w: 0, h: 0 }, IMG_W, IMG_H);
    assert.equal(r.w, MIN_CROP);
    assert.equal(r.h, MIN_CROP);
  });

  test("이미지가 최소 크롭보다 작아도 경계를 넘지 않는다", () => {
    const r = clampRect({ x: 0, y: 0, w: 1, h: 1 }, 8, 6);
    assertInside(r, 8, 6);
  });
});

describe("moveRect", () => {
  test("크기를 유지한 채 이동한다", () => {
    const r = moveRect({ x: 100, y: 100, w: 400, h: 300 }, 50, -40, IMG_W, IMG_H);
    assert.deepEqual(r, { x: 150, y: 60, w: 400, h: 300 });
  });

  test("어느 방향으로 밀어도 이미지 밖으로 나가지 않는다", () => {
    const base = { x: 100, y: 100, w: 400, h: 300 };
    for (const [dx, dy] of [
      [-9999, 0],
      [9999, 0],
      [0, -9999],
      [0, 9999],
      [9999, 9999],
    ]) {
      const moved = moveRect(base, dx, dy, IMG_W, IMG_H);
      assertInside(moved);
      assert.equal(moved.w, 400);
      assert.equal(moved.h, 300);
    }
  });
});

describe("fitRatio", () => {
  test("프리셋으로 바꾸면 정확한 비율이 된다", () => {
    for (const [id, ratio] of [
      ["1:1", 1],
      ["4:3", 4 / 3],
      ["3:2", 1.5],
      ["16:9", 16 / 9],
      ["9:16", 9 / 16],
    ] as const) {
      const r = fitRatio({ x: 400, y: 300, w: 900, h: 900 }, ratio, IMG_W, IMG_H);
      assertInside(r);
      // 정수 반올림 때문에 완전히 같을 수는 없으므로 1px 오차까지 허용한다.
      assert.ok(Math.abs(r.w / r.h - ratio) < 0.01, `${id}: ${r.w}x${r.h}`);
    }
  });

  test("중심점을 최대한 유지한다", () => {
    const start = { x: 800, y: 500, w: 400, h: 400 };
    const r = fitRatio(start, 16 / 9, IMG_W, IMG_H);
    assert.ok(Math.abs(r.x + r.w / 2 - (start.x + start.w / 2)) <= 1);
    assert.ok(Math.abs(r.y + r.h / 2 - (start.y + start.h / 2)) <= 1);
  });

  test("이미지를 넘는 비율 요구는 경계 안의 최대 크기로 보정한다", () => {
    const r = fitRatio({ x: 0, y: 0, w: IMG_W, h: IMG_H }, 9 / 16, IMG_W, IMG_H);
    assertInside(r);
    assert.equal(r.h, IMG_H); // 세로가 한계이므로 세로를 꽉 채운다
    assert.equal(r.w, 900);
  });

  test("free 는 비율을 바꾸지 않고 경계만 보정한다", () => {
    assert.deepEqual(fitRatio({ x: -10, y: 0, w: 500, h: 300 }, null, IMG_W, IMG_H), {
      x: 0,
      y: 0,
      w: 500,
      h: 300,
    });
  });
});

describe("resizeRect", () => {
  const start: Rect = { x: 600, y: 400, w: 800, h: 600 };

  test("반대쪽 모서리를 고정한 채 크기를 바꾼다", () => {
    const se = resizeRect(start, "se", 100, 50, IMG_W, IMG_H, null);
    assert.deepEqual(se, { x: 600, y: 400, w: 900, h: 650 });

    const nw = resizeRect(start, "nw", 100, 50, IMG_W, IMG_H, null);
    assert.deepEqual(nw, { x: 700, y: 450, w: 700, h: 550 });
  });

  test("변 핸들은 한 축만 바꾼다", () => {
    assert.deepEqual(resizeRect(start, "e", 120, 0, IMG_W, IMG_H, null), {
      x: 600,
      y: 400,
      w: 920,
      h: 600,
    });
    assert.deepEqual(resizeRect(start, "n", 0, 100, IMG_W, IMG_H, null), {
      x: 600,
      y: 500,
      w: 800,
      h: 500,
    });
  });

  test("어떤 핸들을 얼마나 끌어도 이미지 경계를 벗어나지 않는다", () => {
    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
    const drags = [-9999, -400, -1, 0, 1, 400, 9999];
    for (const handle of handles) {
      for (const dx of drags) {
        for (const dy of drags) {
          assertInside(resizeRect(start, handle, dx, dy, IMG_W, IMG_H, null));
          assertInside(resizeRect(start, handle, dx, dy, IMG_W, IMG_H, 1));
          assertInside(resizeRect(start, handle, dx, dy, IMG_W, IMG_H, 16 / 9));
        }
      }
    }
  });

  test("비율이 고정되면 드래그 후에도 비율이 유지된다", () => {
    const r = resizeRect({ x: 600, y: 400, w: 800, h: 800 }, "se", 200, 0, IMG_W, IMG_H, 1);
    assert.equal(r.w, r.h);
  });

  test("최소 크롭 크기 아래로는 줄어들지 않는다", () => {
    const r = resizeRect(start, "se", -9999, -9999, IMG_W, IMG_H, null);
    assert.ok(r.w >= MIN_CROP && r.h >= MIN_CROP);
  });

  test("Alt + 방향키 크기 조절도 같은 규칙을 따른다", () => {
    const grown = nudgeSize(start, 10, 0, IMG_W, IMG_H, null);
    assert.equal(grown.w, 810);
    assert.equal(grown.h, 600);
    assertInside(nudgeSize(start, 9999, 0, IMG_W, IMG_H, 1));
  });
});

describe("toPercent · ratioLabel", () => {
  test("오버레이 배치용 백분율", () => {
    assert.deepEqual(toPercent({ x: 600, y: 400, w: 1200, h: 800 }, IMG_W, IMG_H), {
      left: 25,
      top: 25,
      width: 50,
      height: 50,
    });
  });

  test("기약분수로 비율을 표기한다", () => {
    assert.equal(ratioLabel(1080, 1080), "1:1");
    assert.equal(ratioLabel(1920, 1080), "16:9");
    assert.equal(ratioLabel(1200, 800), "3:2");
  });

  test("기약분수가 너무 크면 소수 표기로 바꾼다", () => {
    assert.equal(ratioLabel(1200, 630), "1.90:1");
    assert.equal(ratioLabel(630, 1200), "1:1.90");
  });
});
