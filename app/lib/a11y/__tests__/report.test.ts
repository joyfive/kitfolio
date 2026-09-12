/* ============================================================
   Markdown 보고서: 포함해야 하는 것과 절대 넣지 않는 것
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml } from "../analyze";
import { buildReport } from "../report";
import { RULE_COPY, interpolate } from "../messages";
import { sampleHtml, SAMPLE_SCOPE } from "../sample";
import type { Lang } from "../../content";

/** 컴포넌트의 useT 와 같은 조회 규칙 (현재 언어 → 영문 폴백 → 키) */
function translator(lang: Lang) {
  return (key: string) => RULE_COPY[lang]?.[key] ?? RULE_COPY.en?.[key] ?? key;
}

describe("보고서", () => {
  test("도구명·검사 범위·요약 수치·발견 항목·수동 검사를 포함한다", () => {
    const result = analyzeHtml(sampleHtml("ko"), SAMPLE_SCOPE);
    const md = buildReport(result, "ko", translator("ko"));

    assert.match(md, /HTML 접근성 검사기/);
    assert.match(md, /검사 범위: 전체 문서/);
    assert.match(md, new RegExp(`오류 가능성 높음 ${result.counts.issue}`));
    assert.match(md, /## 수동 검사 \(8\)/);
    assert.match(md, /DOC-001/);
    assert.match(md, /요소 경로/);
  });

  test("원본 HTML 전체를 넣지 않는다", () => {
    const secret = "내부 전용 문구 zz9plural";
    const html = `<main><p>${secret}</p><img src="a.png"><button></button></main>`;
    const md = buildReport(analyzeHtml(html, "fragment"), "ko", translator("ko"));
    assert.ok(!md.includes(secret));
    assert.ok(!md.includes("<main>"));
  });

  test("영문 보고서는 영문 문구로 만들어진다", () => {
    const md = buildReport(analyzeHtml(sampleHtml("en"), SAMPLE_SCOPE), "en", translator("en"));
    assert.match(md, /HTML accessibility report/);
    assert.match(md, /Scope: Full document/);
    assert.match(md, /Manual test \(8\)/);
  });
});

describe("규칙 문구", () => {
  test("모든 Finding 의 문구 키가 KO·EN 양쪽에 존재한다", () => {
    const samples = [
      sampleHtml("ko"),
      '<p>a</p>',
      '<html lang="한국어"><head></head><body><h2>a</h2><h4>b</h4><main>1</main><main>2</main></body></html>',
      '<label for="x">a</label><div id="x"></div><label for="y">b</label>',
      '<input placeholder="p"><input><select></select><textarea></textarea>',
      '<input type="radio" name="g" aria-label="a"><input type="radio" name="g" aria-label="b">',
      '<button></button><a href="/x"></a><details><summary></summary>b</details>',
      '<button aria-label="저장">변경 내용 저장</button><input type="image" src="s.png">',
      '<div role="button" tabindex="0"></div><span role="img">x</span>',
      '<img src="a.png"><img src="b.png" alt=""><img src="c.png" alt="hero.png">',
      '<a href="/x"><img src="a.png" alt=""></a><svg role="img"></svg>',
      '<input aria-describedby="none"><div aria-hidden="true"><button>b</button></div>',
      '<div id="s" aria-labelledby="s"></div>',
      '<div id="p" aria-labelledby="q"></div><div id="q" aria-labelledby="p"></div>',
      '<span id="h" hidden>이름</span><input aria-labelledby="h">',
      '<div tabindex="2">a</div><div tabindex="x">b</div><div onclick="f()">c</div><button tabindex="-1">d</button>',
      '<p id="dup"></p><p id="dup"></p>',
      '<div role="heading">t</div><h2></h2>',
      '<div role="region">r</div><nav>a</nav><nav>b</nav>',
    ];

    const keys = new Set<string>();
    for (const html of samples) {
      for (const scope of ["fragment", "document"] as const) {
        for (const f of analyzeHtml(html, scope).findings) {
          keys.add(f.titleKey);
          keys.add(f.reasonKey);
          keys.add(f.fixKey);
        }
      }
    }
    assert.ok(keys.size > 60, `수집된 키가 너무 적음: ${keys.size}`);

    const missing: string[] = [];
    for (const key of keys) {
      for (const lang of ["ko", "en"] as const) {
        if (!RULE_COPY[lang]?.[key]) missing.push(`${lang}:${key}`);
      }
    }
    assert.deepEqual(missing, []);
  });

  test("문구의 모든 중괄호 자리가 Finding.vars 로 채워진다", () => {
    const html =
      '<html><head><title></title></head><body><h1>a</h1><h3>b</h3><img src="x.png" alt="이미지"><p id="d"></p><p id="d"></p><div tabindex="3">t</div></body></html>';
    for (const lang of ["ko", "en"] as const) {
      const t = translator(lang);
      for (const f of analyzeHtml(html, "document").findings) {
        for (const key of [f.reasonKey, f.fixKey]) {
          const filled = interpolate(t(key), f.vars);
          assert.ok(!/\{\w+\}/.test(filled), `${f.ruleId} ${lang} 미치환: ${filled}`);
        }
      }
    }
  });
});
