/* ============================================================
   보안·개인정보 회귀 테스트 (기획서 8장 · 13장 수용 기준)

   출시 전 반드시 통과해야 하는 두 가지를 코드로 고정한다.
     1. 사용자 HTML 을 파싱해도 외부 네트워크 요청이 발생하지 않는다.
     2. 결과에는 원본 HTML 전체가 아니라 길이가 제한된 코드 조각만 남는다.

   parse5 는 순수 파서라 리소스를 가져오지 않는다. 브라우저 DOMParser 로
   바꾸면 img·iframe 요청이 생길 수 있으므로, 구현이 바뀌어도 이 테스트가
   먼저 깨지게 둔다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml } from "../analyze";
import { LIMITS } from "../types";

const HOSTILE = `<!doctype html>
<html lang="ko">
  <head>
    <title>보안 테스트</title>
    <link rel="stylesheet" href="https://example.invalid/s.css">
    <script src="https://example.invalid/x.js"></script>
    <script>window.__a11yExecuted = true;</script>
    <style>body { background: url(https://example.invalid/bg.png); }</style>
  </head>
  <body>
    <main>
      <img src="https://example.invalid/track.gif" onerror="window.__a11yExecuted = true">
      <iframe src="https://example.invalid/frame.html"></iframe>
      <video src="https://example.invalid/v.mp4" controls></video>
      <audio src="https://example.invalid/a.mp3" controls></audio>
      <object data="https://example.invalid/o.swf"></object>
      <div onclick="window.__a11yExecuted = true">클릭</div>
    </main>
  </body>
</html>`;

describe("네트워크·실행 차단", () => {
  test("파싱과 검사 중 외부 요청이 0건이고 inline 스크립트가 실행되지 않는다", async () => {
    const globalScope = globalThis as Record<string, unknown>;
    const calls: string[] = [];
    const realFetch = globalScope.fetch;
    globalScope.fetch = (...args: unknown[]) => {
      calls.push(String(args[0]));
      throw new Error("검사 중 네트워크 요청이 발생했습니다");
    };
    delete globalScope.__a11yExecuted;

    try {
      const result = analyzeHtml(HOSTILE, "document");
      assert.ok(result.counts.elements > 0);
    } finally {
      if (realFetch) globalScope.fetch = realFetch;
      else delete globalScope.fetch;
    }

    assert.deepEqual(calls, []);
    assert.equal(globalScope.__a11yExecuted, undefined);
  });

  test("script·style 안의 내용은 검사 대상에 들어가지 않는다", () => {
    const result = analyzeHtml(
      '<div><script><img src="x"></script><style>/* <img src="y"> */</style></div>',
      "fragment",
    );
    // div · script · style 3개만 센다 (script 안의 img 는 텍스트다)
    assert.equal(result.counts.elements, 3);
  });
});

describe("결과에 남는 사용자 데이터", () => {
  test("코드 조각은 160자를 넘지 않는다", () => {
    const long = `<img class="${"a".repeat(400)}" src="x.png">`;
    const finding = analyzeHtml(long, "fragment").findings.find((f) => f.ruleId === "IMG-001");
    assert.ok(finding?.snippet);
    assert.ok(
      finding.snippet.length <= LIMITS.snippetChars,
      `조각 길이 ${finding.snippet.length}`,
    );
  });

  test("결과는 원본 HTML 전체를 들고 있지 않다", () => {
    const secret = "사내에만 있는 문구 abcdef123456";
    const html = `<section><p>${secret}</p><img src="a.png"></section>`;
    const result = analyzeHtml(html, "fragment");
    assert.ok(!JSON.stringify(result).includes(secret));
  });

  test("결과 객체에 AST node 참조가 남지 않는다", () => {
    const result = analyzeHtml('<img src="a.png">', "fragment");
    const serialized = JSON.stringify(result);
    assert.ok(!serialized.includes("childNodes"));
    assert.ok(!serialized.includes("parentNode"));
  });
});
