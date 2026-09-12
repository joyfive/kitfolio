/* ============================================================
   HTML 정제: 실행·외부 요청·탐색을 만들 수 있는 것이 남지 않는지

   preview 는 sandbox·CSP 로도 막지만, 셋 중 하나만 믿지 않는다.
   마크업 단계에서 이미 사라졌는지를 여기서 고정한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  detectInputKind,
  escapeHtml,
  sanitizeHtml,
  textToParagraphs,
  NODE_ID_ATTR,
} from "../sanitize";

describe("입력 유형 판별", () => {
  test("유효한 시작 태그가 있어야 HTML 로 본다", () => {
    assert.equal(detectInputKind("<section><p>a</p></section>"), "html");
    assert.equal(detectInputKind("<br>"), "html");
  });

  test("태그처럼 보이는 문자가 섞인 일반 텍스트를 HTML 로 오판하지 않는다", () => {
    assert.equal(detectInputKind("나는 <3 하트를 좋아해"), "text");
    assert.equal(detectInputKind("a < b 이고 b > c 입니다"), "text");
    assert.equal(detectInputKind("그냥 문장입니다"), "text");
  });
});

describe("일반 텍스트 변환", () => {
  test("빈 줄을 문단 경계로 보고 각 문단을 p 로 감싼다", () => {
    const out = textToParagraphs("첫 문단\n둘째 줄\n\n두 번째 문단");
    assert.equal(out, "<p>첫 문단<br>둘째 줄</p>\n<p>두 번째 문단</p>");
  });

  test("텍스트 안의 태그 문자를 HTML 로 해석하지 않는다", () => {
    const out = textToParagraphs('<img src=x onerror="boom()"> & "quoted"');
    // p 와 br 외의 태그가 만들어지지 않아야 한다: 나머지는 전부 문자로만 남는다
    assert.ok(!/<(?!\/?p>|br>)/.test(out), out);
    assert.ok(out.includes("&lt;img"));
    assert.ok(out.includes("onerror=&quot;boom()&quot;"));
    assert.equal(escapeHtml(`<&">'`), "&lt;&amp;&quot;&gt;&#39;");
  });
});

describe("HTML 정제", () => {
  const hostile = `<section class="c" style="background:url(https://evil.test/a.png)">
    <script>window.boom = 1</script>
    <style>.c { color: red }</style>
    <noscript><p>noscript body</p></noscript>
    <img src="https://evil.test/p.png" srcset="https://evil.test/2x.png 2x" alt="사진" width="120" height="80">
    <a href="https://evil.test" target="_blank" download>외부 링크</a>
    <button onclick="boom()" onmouseover="boom()">실행</button>
    <form action="https://evil.test" method="post"><input name="q" formaction="https://evil.test"></form>
    <iframe src="https://evil.test"></iframe>
    <object data="https://evil.test/o.swf"></object>
    <video src="https://evil.test/v.mp4" poster="https://evil.test/p.jpg" controls></video>
    <link rel="stylesheet" href="https://evil.test/s.css">
    <base href="https://evil.test/">
    <svg><use xlink:href="https://evil.test#i"></use><rect width="10" height="10"></rect></svg>
  </section>`;

  const result = sanitizeHtml(hostile);

  test("실행·외부 로드 요소를 통째로 제거한다", () => {
    for (const tag of ["script", "iframe", "object", "embed", "base", "link", "video", "noscript"]) {
      assert.ok(!result.html.includes(`<${tag}`), `${tag} 가 남음`);
    }
    assert.ok(!result.html.includes("noscript body"));
  });

  test("HTML 안의 style 태그는 제거하고 사용자에게 알린다", () => {
    assert.ok(!result.html.includes("<style"));
    assert.equal(result.hadStyleTag, true);
  });

  test("이벤트 핸들러와 외부 요청 속성이 남지 않는다", () => {
    for (const attr of ["onclick", "onmouseover", "onerror", "src=", "srcset", "poster", "formaction", "action=", "download", "target="]) {
      assert.ok(!result.html.includes(attr), `${attr} 가 남음`);
    }
    assert.equal(result.hadExternalResource, true);
  });

  test("외부 링크의 href 는 남기지 않고 # 으로 바꾼다", () => {
    assert.ok(!result.html.includes("evil.test"));
    assert.ok(result.html.includes('href="#"'));
  });

  test("인라인 style 의 url() 은 CSP 와 별개로 제거한다", () => {
    assert.ok(!/url\s*\(/.test(result.html));
  });

  test("이미지는 크기를 유지한 중립 placeholder 가 된다", () => {
    assert.ok(result.html.includes('width="120"'));
    assert.ok(result.html.includes("kf-img-placeholder"));
    // alt 를 남기면 src 없는 이미지가 대체 텍스트를 그려 레이아웃이 달라진다
    assert.ok(!/\salt=/.test(result.html));
    assert.ok(result.html.includes("data-kf-alt"));
    assert.equal(result.hadImage, true);
  });

  test("레이아웃에 필요한 구조와 정적 SVG 도형은 유지한다", () => {
    assert.ok(result.html.includes("<section"));
    assert.ok(result.html.includes("<button"));
    assert.ok(result.html.includes("<form"));
    assert.ok(/<rect width="10" height="10"/.test(result.html));
  });

  test("모든 요소에 원본·검사 대응용 id 를 붙인다", () => {
    const ids = [...result.html.matchAll(new RegExp(`${NODE_ID_ATTR}="([^"]+)"`, "g"))].map(
      (m) => m[1],
    );
    assert.equal(ids.length, result.elementCount);
    assert.equal(new Set(ids).size, ids.length, "id 가 중복됨");
  });

  test("주석은 남기지 않는다", () => {
    assert.ok(!sanitizeHtml("<p>a</p><!-- 내부 메모 -->").html.includes("내부 메모"));
  });

  test("요소 수를 세어 한도 판정에 쓸 수 있다", () => {
    assert.equal(sanitizeHtml("<div><p>a</p><span>b</span></div>").elementCount, 3);
  });
});
