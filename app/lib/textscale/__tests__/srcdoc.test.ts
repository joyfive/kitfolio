/* ============================================================
   preview 문서(srcdoc): CSP 와 style 탈출 방지
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parse } from "parse5";
import { children, isElement, tag, type Node } from "../../a11y/ast";
import {
  PREVIEW_CSP,
  buildSrcdoc,
  cssRequestsExternal,
  neutralizeStyleEnd,
  stripCssResources,
} from "../srcdoc";

describe("CSP", () => {
  test("스크립트·이미지·폰트·미디어·네트워크·폼을 전부 막는다", () => {
    for (const directive of [
      "default-src 'none'",
      "script-src 'none'",
      "img-src 'none'",
      "font-src 'none'",
      "media-src 'none'",
      "connect-src 'none'",
      "form-action 'none'",
      "base-uri 'none'",
    ]) {
      assert.ok(PREVIEW_CSP.includes(directive), `${directive} 누락`);
    }
  });

  test("style 은 inline 만 허용한다 (사용자 CSS 와 프리셋 override 용)", () => {
    assert.ok(PREVIEW_CSP.includes("style-src 'unsafe-inline'"));
    assert.ok(!/style-src[^;]*https?:/.test(PREVIEW_CSP));
  });

  test("CSP 위반 보고 endpoint 를 두지 않는다", () => {
    // 사용자 CSS 의 URL 이 보고 payload 에 실려 나갈 수 있다
    assert.ok(!/report-uri|report-to/i.test(PREVIEW_CSP));
  });

  test("CSP meta 가 head 의 첫 요소로 들어간다", () => {
    const doc = buildSrcdoc({ body: "<p>a</p>", css: "", viewport: 320, lang: "ko" });
    const head = doc.slice(doc.indexOf("<head>"), doc.indexOf("</head>"));
    const firstTag = head.split("\n").filter((l) => l.trim().startsWith("<"))[1];
    assert.match(firstTag, /Content-Security-Policy/);
  });
});

describe("style 요소 탈출 방지", () => {
  test("사용자 CSS 안의 </style 이 요소를 끊지 못한다", () => {
    const css = `.a { content: "</style><script>boom()</script>" }`;
    const doc = buildSrcdoc({ body: "", css, viewport: 768, lang: "ko" });
    // CSS 에서 \\/ 는 / 의 이스케이프라 값의 의미는 같고, 태그로는 읽히지 않는다
    assert.ok(doc.includes("<\\/style>"));
    // 실제로 브라우저가 어떻게 읽는지로 판정한다: script 요소가 생기면 안 된다
    const tree = parse(doc);
    assert.equal(countTag(tree, "script"), 0);
  });

  test("대소문자를 섞어도 막는다", () => {
    assert.equal(neutralizeStyleEnd("a{}</StYlE>"), "a{}<\\/StYlE>");
  });
});

describe("외부 리소스 안내", () => {
  test("@import 와 절대 URL 을 감지해 사용자에게 알린다", () => {
    assert.equal(cssRequestsExternal("@import url('https://fonts.test/x.css');"), true);
    assert.equal(cssRequestsExternal(".a{background:url(//cdn.test/a.png)}"), true);
    assert.equal(cssRequestsExternal(".a{color:red}"), false);
    assert.equal(cssRequestsExternal(".a{background:url(#local)}"), false);
  });
});

describe("내부 viewport", () => {
  test("meta viewport 가 선택한 CSS px 를 따른다", () => {
    assert.match(
      buildSrcdoc({ body: "", css: "", viewport: 320, lang: "ko" }),
      /content="width=320, initial-scale=1"/,
    );
  });

  test("lang 은 ko·en 만 들어간다", () => {
    assert.match(buildSrcdoc({ body: "", css: "", viewport: 768, lang: "en" }), /<html lang="en">/);
    assert.match(buildSrcdoc({ body: "", css: "", viewport: 768, lang: "xx" }), /<html lang="ko">/);
  });
});


describe("사용자 CSS 의 외부 리소스", () => {
  test("@import 규칙을 통째로 제거한다", () => {
    assert.equal(stripCssResources('@import url("https://x.test/a.css"); .a{color:red}').trim(), ".a{color:red}");
    assert.equal(stripCssResources("@import 'https://x.test/a.css';").trim(), "");
  });

  test("원격·로컬 url() 을 모두 지운다", () => {
    assert.match(stripCssResources(".a{background:url(https://x.test/b.png)}"), /background:none/);
    assert.match(stripCssResources('.a{background:url("//cdn.test/b.png")}'), /background:none/);
    assert.match(stripCssResources(".a{background:url('/local.png')}"), /background:none/);
  });

  test("문서 안을 가리키는 url(#id) 는 유지한다 (SVG filter·gradient 참조)", () => {
    assert.match(stripCssResources(".a{filter:url(#blur)}"), /filter:url\(#blur\)/);
  });

  test("빌드된 preview 문서에 외부 URL 이 남지 않는다", () => {
    const doc = buildSrcdoc({
      body: "<p>a</p>",
      css: '@import url("https://evil.test/f.css"); .a{background:url(https://evil.test/b.png)}',
      viewport: 768,
      lang: "ko",
    });
    assert.ok(!doc.includes("evil.test"));
  });
});

/** 파싱 결과에서 특정 태그가 몇 개 만들어졌는지 센다 */
function countTag(node: Node, name: string): number {
  let n = 0;
  if (isElement(node) && tag(node) === name) n += 1;
  for (const child of children(node)) n += countTag(child, name);
  return n;
}