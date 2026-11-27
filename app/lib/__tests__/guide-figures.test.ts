/* ============================================================
   사용 가이드 도해 테스트

   공개 도구는 모두 ko·en 도해(화면 목업 + 번호 마커 + 번호별 설명)를 가진다.
   마커는 1부터 빠짐없이 이어지고, 설명 수와 같아야 한다.
   ko·en 은 같은 화면을 그리므로 부품 순서와 마커 위치가 같아야 한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { publishedTools } from "../content.ts";
import { FIGURE_VARIANTS, GUIDE_FIGURES } from "../guide-figures/index.ts";
import type { GuideFigure } from "../guide-figures/types.ts";

const keysFor = (slug: string) => FIGURE_VARIANTS[slug]?.map((v) => `${slug}/${v}`) ?? [slug];
const shape = (figure: GuideFigure) => figure.parts.map((part) => `${part.t}:${part.m ?? "-"}`).join(" ");

describe("guide figures", () => {
  test("모든 공개 도구에 ko·en 도해가 있다", () => {
    for (const tool of publishedTools())
      for (const key of keysFor(tool.slug)) {
        assert.ok(GUIDE_FIGURES[key]?.ko, `${key}: ko 도해 없음`);
        assert.ok(GUIDE_FIGURES[key]?.en, `${key}: en 도해 없음`);
      }
  });

  test("공개되지 않은 도구의 도해가 남아 있지 않다", () => {
    const valid = new Set(publishedTools().flatMap((tool) => keysFor(tool.slug)));
    for (const key of Object.keys(GUIDE_FIGURES)) assert.ok(valid.has(key), `${key}: 대응하는 공개 도구 없음`);
  });

  for (const [key, entry] of Object.entries(GUIDE_FIGURES)) {
    test(`${key}: 마커가 1부터 이어지고 설명 수와 같다`, () => {
      for (const lang of ["ko", "en"] as const) {
        const figure = entry[lang];
        const marks = figure.parts.flatMap((part) => (part.m ? [part.m] : []));
        assert.deepEqual(marks, marks.map((_, i) => i + 1), `${key}.${lang}: 마커 순서 ${marks.join(",")}`);
        assert.ok(marks.length >= 2 && marks.length <= 5, `${key}.${lang}: 마커는 2~5개`);
        assert.equal(figure.notes.length, marks.length, `${key}.${lang}: 설명 ${figure.notes.length}개 · 마커 ${marks.length}개`);
        assert.ok(figure.caption.trim(), `${key}.${lang}: caption 없음`);
        for (const note of figure.notes) assert.ok(note.title.trim() && note.body.trim(), `${key}.${lang}: 빈 설명`);
      }
    });

    test(`${key}: ko·en 이 같은 화면 구조다`, () => {
      assert.equal(shape(entry.en), shape(entry.ko));
    });
  }
});
