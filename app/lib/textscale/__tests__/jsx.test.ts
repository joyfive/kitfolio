/* ============================================================
   JSX·TSX → HTML 변환

   여기서 고정하는 것은 "레이아웃을 만드는 것이 그대로 남는가"다.
   className·style·목록 반복·control 은 확대와 리플로 판정에 직접 쓰이므로
   값이 달라지면 검사 결과가 달라진다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { LIST_REPEAT, collapseJsxText, jsxToHtml } from "../jsx";
import { PreviewError } from "../types";
import { sampleJsx } from "../sample";
import { sanitizeHtml } from "../sanitize";

describe("파싱 입력 형태", () => {
  test("TSX 컴포넌트 파일 전체에서 default export 의 JSX 를 고른다", () => {
    const { html } = jsxToHtml(`
      import clsx from "clsx";

      function Helper() {
        return <p>helper</p>;
      }

      export default function Card({ title }: { title: string }) {
        return <section className="card"><h2>{title}</h2></section>;
      }
    `);
    assert.ok(html.includes('<section class="card">'), html);
    assert.ok(!html.includes("helper"), html);
  });

  test("return 안쪽만 잘라 온 형제 요소도 받아들인다", () => {
    const { html } = jsxToHtml(`<h2 className="a">제목</h2>\n<p className="b">본문</p>`);
    assert.ok(html.includes('<h2 class="a">제목</h2>'), html);
    assert.ok(html.includes('<p class="b">본문</p>'), html);
  });

  test("JSX 가 없으면 jsx-no-element", () => {
    assert.throws(
      () => jsxToHtml("export const spacing = 4;"),
      (e: unknown) => e instanceof PreviewError && e.type === "jsx-no-element",
    );
  });

  test("어떤 방법으로도 파싱할 수 없으면 jsx-parse-failed", () => {
    assert.throws(
      () => jsxToHtml("<div className={{{>"),
      (e: unknown) => e instanceof PreviewError && e.type === "jsx-parse-failed",
    );
  });
});

describe("속성 변환", () => {
  test("React prop 이름을 HTML 속성으로 바꾼다", () => {
    const { html } = jsxToHtml(
      `<label className="lbl" htmlFor="q" tabIndex={-1}><input readOnly maxLength={20} defaultValue="hi" /></label>`,
    );
    assert.ok(html.includes('class="lbl"'), html);
    assert.ok(html.includes('for="q"'), html);
    assert.ok(html.includes('tabindex="-1"'), html);
    assert.ok(html.includes("readonly"), html);
    assert.ok(html.includes('maxlength="20"'), html);
    assert.ok(html.includes('value="hi"'), html);
  });

  test("이벤트 핸들러와 React 전용 prop 은 남기지 않는다", () => {
    const { html, notes } = jsxToHtml(
      `<button onClick={() => fire()} key="k" ref={r} className="btn">저장</button>`,
    );
    assert.ok(!/onclick/i.test(html), html);
    assert.ok(!/\bkey=/.test(html), html);
    assert.ok(!/\bref=/.test(html), html);
    assert.ok(html.includes('class="btn"'), html);
    assert.deepEqual(notes.dropped, ["key", "ref"]);
  });

  test("style 객체를 CSS 문자열로 바꾸고 숫자에 px 를 붙인다", () => {
    const { html } = jsxToHtml(
      `<div style={{ maxWidth: 560, lineHeight: 1.5, display: "flex", WebkitBoxOrient: "vertical" }} />`,
    );
    assert.ok(html.includes("max-width:560px"), html);
    assert.ok(html.includes("line-height:1.5"), html);
    assert.ok(html.includes("display:flex"), html);
    assert.ok(html.includes("-webkit-box-orient:vertical"), html);
  });

  test("{...props} 는 값을 알 수 없어 세어 두기만 한다", () => {
    const { html, notes } = jsxToHtml(`<div {...rest} className="x" />`);
    assert.equal(notes.spreads, 1);
    assert.ok(html.includes('class="x"'), html);
  });
});

describe("className 표현식", () => {
  test("템플릿 리터럴의 확정된 부분을 남긴다", () => {
    const { html } = jsxToHtml("<div className={`flex gap-4 ${extra}`} />");
    assert.ok(html.includes('class="flex gap-4"'), html);
  });

  test("cn()·clsx() 의 문자열 인자를 모두 모은다", () => {
    const { html } = jsxToHtml(
      `<div className={cn("flex w-64", isWide && "md:w-96", { "is-open": open })} />`,
    );
    const cls = /class="([^"]*)"/.exec(html)?.[1]?.split(" ") ?? [];
    assert.deepEqual(cls.sort(), ["flex", "is-open", "md:w-96", "w-64"]);
  });

  test("삼항 연산자는 서로 충돌하지 않도록 앞 분기만 쓴다", () => {
    const { html } = jsxToHtml(`<div className={open ? "block" : "hidden"} />`);
    assert.ok(html.includes('class="block"'), html);
    assert.ok(!html.includes("hidden"), html);
  });
});

describe("자식 렌더링", () => {
  test("표현식은 식 자체를 자리표시자 텍스트로 남긴다", () => {
    const { html, notes } = jsxToHtml(`<h2>{project.name} 접근성 검수</h2>`);
    assert.ok(html.includes("project.name 접근성 검수"), html);
    assert.equal(notes.expressions, 1);
  });

  test("map 으로 그리는 목록은 여러 번 반복한다", () => {
    const { html, notes } = jsxToHtml(
      `<ul>{tags.map((tag) => <li className="tag">{tag}</li>)}</ul>`,
    );
    assert.equal(html.split('<li class="tag">').length - 1, LIST_REPEAT);
    assert.equal(notes.lists, 1);
  });

  test("조건부 렌더는 JSX 가 나오는 분기를 그린다", () => {
    const { html } = jsxToHtml(`<div>{isOpen && <p className="panel">열림</p>}</div>`);
    assert.ok(html.includes('<p class="panel">열림</p>'), html);
  });

  test("주석 표현식은 아무것도 남기지 않는다", () => {
    const { html } = jsxToHtml(`<div>{/* TODO */}<span>본문</span></div>`);
    assert.ok(!html.includes("TODO"), html);
    assert.ok(html.includes("<span>본문</span>"), html);
  });

  test("텍스트 사이 줄바꿈과 들여쓰기를 공백 하나로 잇는다", () => {
    assert.equal(collapseJsxText("\n      첫 줄\n      둘째 줄\n    "), "첫 줄 둘째 줄");
    assert.equal(collapseJsxText(" 사이 "), " 사이 ");
  });
});

describe("컴포넌트 대체", () => {
  test("이름으로 짐작되는 control 은 대응 요소로 그린다", () => {
    const { html, notes } = jsxToHtml(`<Button className="px-4">저장</Button>`);
    assert.ok(html.includes("<button"), html);
    assert.ok(html.includes('data-kf-component="Button"'), html);
    assert.deepEqual(notes.components, ["Button → button"]);
  });

  test("모르는 컴포넌트는 스타일이 있을 때만 컨테이너로 남긴다", () => {
    const styled = jsxToHtml(`<Card className="w-64"><p>본문</p></Card>`);
    assert.ok(styled.html.startsWith('<div class="w-64"'), styled.html);

    const plain = jsxToHtml(`<Providers><p>본문</p></Providers>`);
    assert.equal(plain.html, "<p>본문</p>");
    assert.deepEqual(plain.notes.components, ["Providers → (생략)"]);
  });

  test("Fragment 는 자식만 남긴다", () => {
    const { html } = jsxToHtml(`<><p>하나</p><p>둘</p></>`);
    assert.equal(html, "<p>하나</p><p>둘</p>");
  });

  test("네임스페이스 컴포넌트는 마지막 이름으로 판단한다", () => {
    const { html } = jsxToHtml(`<Dialog.Title className="t">제목</Dialog.Title>`);
    assert.ok(html.includes('data-kf-component="Dialog.Title"'), html);
  });
});

describe("안전", () => {
  test("텍스트와 속성값의 태그 문자를 이스케이프한다", () => {
    const { html } = jsxToHtml(`<div title={"a\\"><script>x</script>"}>{"<img src=x>"}</div>`);
    assert.ok(!/<script/i.test(html), html);
    assert.ok(!/<img/i.test(html), html);
  });

  test("void 요소는 닫는 태그를 만들지 않는다", () => {
    const { html } = jsxToHtml(`<div><br /><hr /><input type="text" /></div>`);
    assert.ok(!html.includes("</br>"), html);
    assert.ok(!html.includes("</input>"), html);
  });

  test("변환 결과가 정제를 거치면 실행·외부 요청 수단이 남지 않는다", () => {
    // JSX 는 소문자 onclick 도 그냥 속성이라 여기서는 남을 수 있다.
    // preview 로 가는 경로는 항상 sanitizeHtml 을 통과하므로 거기서 사라져야 한다.
    const { html } = jsxToHtml(
      `<div onclick="boom()" dangerouslySetInnerHTML={{ __html: "<script>x</script>" }}>` +
        `<img src="https://evil.test/p.png" alt="a" />` +
        `<a href="https://evil.test" target="_blank">외부</a>` +
        `</div>`,
    );
    const clean = sanitizeHtml(html);
    assert.ok(!/onclick/i.test(clean.html), clean.html);
    assert.ok(!/<script/i.test(clean.html), clean.html);
    assert.ok(!clean.html.includes("evil.test"), clean.html);
  });

  test("정제가 Tailwind 후보로 쓸 클래스를 모아 준다", () => {
    const { html } = jsxToHtml(`<div className="flex gap-4"><p className="truncate">a</p></div>`);
    const clean = sanitizeHtml(html);
    assert.deepEqual(clean.classNames.sort(), ["flex", "gap-4", "truncate"]);
  });
});

describe("내장 예시", () => {
  for (const lang of ["ko", "en"] as const) {
    test(`${lang} 예시가 검사에 필요한 구조를 모두 만든다`, () => {
      const { html, notes } = jsxToHtml(sampleJsx(lang));
      assert.ok(html.includes("h-[230px]"), html);
      assert.ok(html.includes("w-[560px]"), html);
      assert.ok(html.includes("whitespace-nowrap"), html);
      assert.ok(html.includes("<button"), html);
      // 배지 3개가 목록 반복으로 그려진다
      assert.equal(html.split("rounded-full").length - 1, LIST_REPEAT);
      assert.equal(notes.lists, 1);
      assert.ok(notes.expressions >= 1);
    });
  }
});
