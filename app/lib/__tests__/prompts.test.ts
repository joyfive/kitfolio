/* ============================================================
   업무 프롬프트 (/prompts) 검사

   - 메뉴 경로 토큰 {{ui:<id>}}: 없는 id·언어는 조용히 빈칸이 되지 않고 실패해야 한다
   - content/prompts 의 모든 글: 필수 프론트매터 · 렌더 가능 · 관련 도구 존재
   - ui-paths 상수: 확인일 형식 · 최소 한 언어 경로
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { UI_PATHS, resolveUiPaths } from "../ui-paths.ts";
import { getPrompt, getPromptSlugs, oldestUiVerifiedAt } from "../prompts.ts";
import { getTool } from "../content.ts";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("메뉴 경로 토큰", () => {
  test("토큰을 해당 언어 경로로 바꾸고, 쓰인 경로를 돌려준다", () => {
    const [id, p] = Object.entries(UI_PATHS).find(([, v]) => v.ko)!;
    const { text, used } = resolveUiPaths(`앞 {{ui:${id}}} 뒤 {{ui:${id}}}`, "ko");
    assert.equal(text, `앞 ${p.ko} 뒤 ${p.ko}`);
    assert.deepEqual(used, [{ id, service: p.service, verifiedAt: p.verifiedAt }]);
  });

  test("없는 id 는 실패한다", () => {
    assert.throws(() => resolveUiPaths("{{ui:no-such-path}}", "ko"), /알 수 없는 메뉴 경로/);
  });

  test("해당 언어 경로가 없으면 실패한다", () => {
    const missingEn = Object.entries(UI_PATHS).find(([, v]) => !v.en);
    if (!missingEn) return;
    assert.throws(() => resolveUiPaths(`{{ui:${missingEn[0]}}}`, "en"), /en 경로가 비어 있음/);
  });

  test("토큰이 없으면 본문을 그대로 둔다", () => {
    assert.deepEqual(resolveUiPaths("그냥 {{문장}}", "ko"), { text: "그냥 {{문장}}", used: [] });
  });

  test("가장 오래된 확인일을 고른다", () => {
    assert.equal(
      oldestUiVerifiedAt([
        { id: "a", service: "x", verifiedAt: "2026-11-19" },
        { id: "b", service: "x", verifiedAt: "2026-10-01" },
      ]),
      "2026-10-01",
    );
    assert.equal(oldestUiVerifiedAt([]), null);
  });

  for (const [id, p] of Object.entries(UI_PATHS)) {
    test(`ui-paths ${id}: 확인일 형식 · 경로 존재`, () => {
      assert.match(p.verifiedAt, DATE);
      assert.ok(p.ko || p.en, "ko·en 중 하나는 있어야 한다");
    });
  }
});

describe("content/prompts 글", () => {
  for (const lang of ["ko", "en"] as const) {
    for (const slug of getPromptSlugs(lang)) {
      test(`${slug}.${lang}: 필수 프론트매터 · 렌더 · 관련 도구`, () => {
        const post = getPrompt(slug, lang);
        assert.ok(post, "렌더 실패");
        const { meta, html } = post;
        assert.ok(meta.title && meta.title !== slug, "title 필수");
        assert.ok(meta.description, "description 필수");
        assert.match(meta.date, DATE, "date(게재일) 필수 · YYYY-MM-DD");
        if (meta.updated) assert.match(meta.updated, DATE);
        assert.ok(!/\{\{ui:/.test(html), "치환되지 않은 메뉴 경로 토큰");
        for (const s of meta.relatedTools) assert.doesNotThrow(() => getTool(s), `relatedTools: ${s} 없음`);
      });
    }
  }

  test("파일 이름 규칙: <slug>.<ko|en>.md 또는 _ 로 시작하는 템플릿", () => {
    const dir = path.join(process.cwd(), "content", "prompts");
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (f === "README.md" || f.startsWith("_")) continue;
      assert.match(f, /^[a-z0-9][a-z0-9-]*\.(ko|en)\.md$/, `${f}: 파일 이름 규칙 위반`);
    }
  });
});
