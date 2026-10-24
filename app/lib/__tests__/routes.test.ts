/* ============================================================
   페이지 = 도구 단위 검사

   도구 하나는 독립 URL 페이지 하나(`/<slug>` · `/en/<slug>`)이고, 레지스트리 항목 하나다.
   레지스트리에 ready 로 넣으면 허브 카드 · sitemap · 허브 ItemList · 메타데이터 ·
   WebApplication/FAQPage JSON-LD 가 자동으로 따라온다 (publishedTools · buildToolMetadata ·
   toolJsonLd). 이 테스트는 그 연결이 끊긴 경우를 잡는다:
   - 레지스트리에 없는 도구 페이지 (카드·sitemap·SEO 에서 빠진다)
   - 페이지가 없는 공개 도구 (카드가 404 로 간다)
   - KO/EN 페이지·OG 이미지 누락, 다른 slug·언어로 연결된 래퍼
   `?mode=` 탭은 페이지가 아니므로 여기서 다루지 않는다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CATEGORIES, LEGAL_SLUGS, SITE, TOOLS, hubJsonLd, publishedTools } from "../content.ts";
import sitemap from "../../sitemap.ts";

const APP = path.join(process.cwd(), "app");
// 도구가 아닌 페이지: 소개·문의·약관 · 블로그 · EN 루트(app/en/page.tsx = EN 허브)
const NON_TOOL_ROUTES = new Set<string>([...LEGAL_SLUGS, "blog", "en"]);

function pageDirs(base: string): string[] {
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(base, d.name, "page.tsx")))
    .map((d) => d.name);
}

/** 페이지 래퍼가 렌더하는 컴포넌트 소스 (로컬 import 를 두 단계까지 따라간다:
 *  계산기 묶음은 하위 폴더 컴포넌트가 공통 셸을 import 하는 구조라서) */
function componentSource(pageFile: string): string {
  const seen = new Set<string>();
  let out = "";
  const visit = (file: string, depth: number) => {
    if (seen.has(file) || !fs.existsSync(file)) return;
    seen.add(file);
    const src = fs.readFileSync(file, "utf8");
    out += src;
    if (depth === 0) return;
    for (const m of src.matchAll(/from "(\.{1,2}\/[\w/.-]+)"/g)) {
      const base = path.resolve(path.dirname(file), m[1]);
      for (const f of [base + ".tsx", base + ".ts", path.join(base, "index.tsx")]) visit(f, depth - 1);
    }
  };
  visit(pageFile, 3);
  return out;
}

const published = publishedTools();
const slugs = new Set(published.map((t) => t.slug));

describe("페이지 ↔ 레지스트리", () => {
  test("모든 도구 페이지가 레지스트리의 공개 도구다 (KO · EN)", () => {
    for (const base of [APP, path.join(APP, "en")]) {
      for (const dir of pageDirs(base)) {
        if (NON_TOOL_ROUTES.has(dir)) continue;
        assert.ok(slugs.has(dir), `${path.relative(APP, path.join(base, dir))}: 레지스트리에 ready 도구로 없음`);
      }
    }
  });

  for (const t of published) {
    test(`${t.slug}: KO/EN 페이지 · OG 이미지 · 메타데이터 · JSON-LD 연결`, () => {
      for (const lang of ["ko", "en"] as const) {
        const dir = lang === "ko" ? path.join(APP, t.slug) : path.join(APP, "en", t.slug);
        const page = path.join(dir, "page.tsx");
        const og = path.join(dir, "opengraph-image.tsx");
        assert.ok(fs.existsSync(page), `${page} 없음`);
        assert.ok(fs.existsSync(og), `${og} 없음`);
        const src = fs.readFileSync(page, "utf8");
        assert.ok(src.includes(`buildToolMetadata("${t.slug}", "${lang}")`), `${page}: buildToolMetadata("${t.slug}", "${lang}")`);
        assert.ok(src.includes(`toolJsonLd("${t.slug}", "${lang}")`), `${page}: toolJsonLd("${t.slug}", "${lang}")`);
        assert.ok(fs.readFileSync(og, "utf8").includes(`toolOgImage("${t.slug}", "${lang}")`), `${og}: toolOgImage("${t.slug}", "${lang}")`);
      }
      const comp = componentSource(path.join(APP, t.slug, "page.tsx"));
      for (const part of ["<PageHead", "<Faq", "<RelatedTools"])
        assert.ok(comp.includes(part), `${t.slug}: 컴포넌트에 ${part} 없음`);
    });
  }
});

describe("자동 노출: 허브 · sitemap · ItemList", () => {
  test("sitemap 에 모든 공개 도구 페이지가 KO · EN 으로 들어 있다", () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const t of published) {
      assert.ok(urls.has(`${SITE.url}/${t.slug}`), `sitemap: /${t.slug}`);
      assert.ok(urls.has(`${SITE.url}/en/${t.slug}`), `sitemap: /en/${t.slug}`);
    }
  });

  test("허브 ItemList 는 공개 도구 전체와 같다", () => {
    for (const lang of ["ko", "en"] as const) {
      const list = (hubJsonLd(lang)[1] as { itemListElement: unknown[] }).itemListElement;
      assert.equal(list.length, published.length);
    }
  });

  test("레지스트리는 카테고리 순서로 묶여 있다 (허브 카드 · 문서 표 순서)", () => {
    const order = CATEGORIES.map((c) => c.id);
    const seq = TOOLS.map((t) => order.indexOf(t.category));
    for (let i = 1; i < seq.length; i++)
      assert.ok(seq[i] >= seq[i - 1], `${TOOLS[i].slug}: ${TOOLS[i - 1].slug} 뒤에 올 수 없음`);
  });
});
