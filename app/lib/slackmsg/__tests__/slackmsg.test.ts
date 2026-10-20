/* ============================================================
   슬랙 메시지 빌더 테스트

   방침: Block Kit JSON 은 스냅샷이 아니라 필드 단위로 비교한다.
   코드 생성은 각 언어 코드에서 페이로드를 다시 읽어 원래 값과 같은지
   왕복 검사한다 (따옴표·역슬래시·줄바꿈·한글·이모지 포함).
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { newBlock, newButton, type EditorBlock } from "../model.ts";
import { escapeMrkdwn, parseInline, parseMrkdwn, toPlainText } from "../mrkdwn.ts";
import { autoFallback, blockJson, buildPayload, AUTO_FALLBACK_MAX, type Payload } from "../blocks.ts";
import { LIMITS, validate } from "../limits.ts";
import { buildCode, CHANNEL_PLACEHOLDER, CODE_TABS, shellQuote } from "../snippets.ts";
import { template, TEMPLATE_IDS } from "../templates.ts";

describe("escapeMrkdwn", () => {
  test("일반 텍스트의 & < > 를 바꾼다", () => {
    assert.equal(escapeMrkdwn("a < b & c > d"), "a &lt; b &amp; c &gt; d");
  });

  test("멘션·채널·특수 멘션·날짜·링크 토큰은 그대로 둔다", () => {
    const src = "<@U0123> <#C0456> <!here> <!date^1700000000^{date_short}|Nov 14> <https://a.com/x?y=1|link>";
    assert.equal(escapeMrkdwn(src), src);
  });

  test("링크 표시 텍스트의 & 는 이스케이프하고 < > 는 토큰 밖에서만 바꾼다", () => {
    assert.equal(escapeMrkdwn("<https://a.com|A & B>"), "<https://a.com|A &amp; B>");
    assert.equal(escapeMrkdwn("x<y <https://a.com>"), "x&lt;y <https://a.com>");
  });

  test("토큰처럼 보이지만 아닌 꺾쇠는 이스케이프한다", () => {
    assert.equal(escapeMrkdwn("<div>"), "&lt;div&gt;");
    assert.equal(escapeMrkdwn("<@ U1>"), "&lt;@ U1&gt;");
  });

  test("줄 앞 인용 기호는 남기고 줄 중간의 > 는 바꾼다", () => {
    assert.equal(escapeMrkdwn("> 인용 a>b\n일반 > 줄"), "> 인용 a&gt;b\n일반 &gt; 줄");
  });
});

describe("parseMrkdwn (미리보기)", () => {
  test("굵게·기울임·취소선·코드", () => {
    assert.deepEqual(parseInline("*a* _b_ ~c~ `d`"), [
      { t: "b", c: [{ t: "text", v: "a" }] },
      { t: "text", v: " " },
      { t: "i", c: [{ t: "text", v: "b" }] },
      { t: "text", v: " " },
      { t: "s", c: [{ t: "text", v: "c" }] },
      { t: "text", v: " " },
      { t: "code", v: "d" },
    ]);
  });

  test("링크·멘션 토큰", () => {
    assert.deepEqual(parseInline("<https://a.com|문서> <@U1> <!here>"), [
      { t: "link", href: "https://a.com", label: "문서" },
      { t: "text", v: " " },
      { t: "mention", v: "@U1" },
      { t: "text", v: " " },
      { t: "mention", v: "@here" },
    ]);
  });

  test("코드 블록과 인용", () => {
    const lines = parseMrkdwn("앞\n```\nconst a = 1;\n```\n> 인용");
    assert.deepEqual(lines, [
      { t: "line", c: [{ t: "text", v: "앞" }] },
      { t: "pre", v: "const a = 1;" },
      { t: "quote", c: [{ t: "text", v: "인용" }] },
    ]);
  });

  test("닫히지 않은 코드 펜스는 일반 텍스트", () => {
    const lines = parseMrkdwn("a ```b");
    assert.equal(lines.length, 1);
    assert.equal(lines[0].t, "line");
  });
});

describe("toPlainText · autoFallback", () => {
  test("서식 기호와 토큰을 걷어낸다", () => {
    assert.equal(
      toPlainText("*배포* 완료 <https://a.com|링크> <@U1> `v2`\n> 끝"),
      "배포 완료 링크 @U1 v2 끝",
    );
  });

  test("헤더 + 첫 텍스트를 잇는다", () => {
    const model: EditorBlock[] = [
      { id: "1", type: "header", text: "배포 완료" },
      { id: "2", type: "divider" },
      { id: "3", type: "text", text: "*production* 반영" },
      { id: "4", type: "text", text: "무시됨" },
    ];
    assert.equal(autoFallback(model), "배포 완료 · production 반영");
  });

  test("길면 자르고 말줄임표를 붙인다", () => {
    const s = autoFallback([{ id: "1", type: "text", text: "가".repeat(400) }]);
    assert.equal(s.length, AUTO_FALLBACK_MAX);
    assert.ok(s.endsWith("…"));
  });
});

describe("blockJson", () => {
  test("텍스트 → section mrkdwn (이스케이프 포함)", () => {
    assert.deepEqual(blockJson({ id: "1", type: "text", text: "a & b" }), {
      type: "section",
      text: { type: "mrkdwn", text: "a &amp; b" },
    });
  });

  test("제목 → header plain_text (이스케이프 없음)", () => {
    assert.deepEqual(blockJson({ id: "1", type: "header", text: "A & B" }), {
      type: "header",
      text: { type: "plain_text", text: "A & B", emoji: true },
    });
  });

  test("구분선 · 필드 · 보조 문구", () => {
    assert.deepEqual(blockJson({ id: "1", type: "divider" }), { type: "divider" });
    assert.deepEqual(blockJson({ id: "1", type: "fields", fields: ["*a*", "b"] }), {
      type: "section",
      fields: [
        { type: "mrkdwn", text: "*a*" },
        { type: "mrkdwn", text: "b" },
      ],
    });
    assert.deepEqual(blockJson({ id: "1", type: "context", text: "c" }), {
      type: "context",
      elements: [{ type: "mrkdwn", text: "c" }],
    });
  });

  test("이미지: 제목은 있을 때만", () => {
    assert.deepEqual(blockJson({ id: "1", type: "image", url: "https://a.com/x.png", alt: "x", title: "" }), {
      type: "image",
      image_url: "https://a.com/x.png",
      alt_text: "x",
    });
    const withTitle = blockJson({ id: "1", type: "image", url: "https://a.com/x.png", alt: "x", title: "T" });
    assert.deepEqual(withTitle.title, { type: "plain_text", text: "T", emoji: true });
  });

  test("버튼: 빈 속성은 생략하고 링크·액션·스타일을 넣는다", () => {
    const b = blockJson({
      id: "1",
      type: "actions",
      buttons: [
        newButton({ text: "열기", url: "https://a.com" }),
        newButton({ text: "롤백", actionId: "rollback", value: "v1", style: "danger" }),
      ],
    });
    assert.deepEqual(b, {
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "열기", emoji: true }, url: "https://a.com" },
        {
          type: "button",
          text: { type: "plain_text", text: "롤백", emoji: true },
          action_id: "rollback",
          value: "v1",
          style: "danger",
        },
      ],
    });
  });

  test("텍스트 + 버튼 → section accessory", () => {
    const b = blockJson({ id: "1", type: "textButton", text: "t", button: newButton({ text: "go", url: "https://a.com" }) });
    assert.equal(b.type, "section");
    assert.deepEqual(b.accessory, {
      type: "button",
      text: { type: "plain_text", text: "go", emoji: true },
      url: "https://a.com",
    });
  });

  test("새 블록 8종이 모두 직렬화된다", () => {
    for (const type of ["text", "header", "divider", "fields", "context", "image", "actions", "textButton"] as const) {
      assert.ok(blockJson(newBlock(type)).type);
    }
  });
});

describe("validate", () => {
  const codes = (model: EditorBlock[], fb = "fallback") => validate(model, fb).map((i) => `${i.code}:${i.field ?? ""}`);

  test("섹션 텍스트 한도 경계 (이스케이프 후 길이)", () => {
    assert.deepEqual(codes([{ id: "1", type: "text", text: "a".repeat(LIMITS.sectionText) }]), []);
    assert.deepEqual(codes([{ id: "1", type: "text", text: "a".repeat(LIMITS.sectionText + 1) }]), ["tooLong:text"]);
    // & 하나가 &amp; 5자가 된다
    assert.deepEqual(
      codes([{ id: "1", type: "text", text: "a".repeat(LIMITS.sectionText - 4) + "&" }]),
      ["tooLong:text"],
    );
  });

  test("헤더 150자 · 버튼 75자 경계", () => {
    assert.deepEqual(codes([{ id: "1", type: "header", text: "a".repeat(150) }]), []);
    assert.deepEqual(codes([{ id: "1", type: "header", text: "a".repeat(151) }]), ["tooLong:text"]);
    const btn = (n: number): EditorBlock => ({ id: "1", type: "actions", buttons: [newButton({ text: "b".repeat(n) })] });
    assert.deepEqual(codes([btn(75)]), []);
    assert.deepEqual(codes([btn(76)]), ["tooLong:button.text"]);
  });

  test("빈 값은 오류", () => {
    assert.deepEqual(codes([newBlock("text")]), ["empty:text"]);
    assert.deepEqual(codes([newBlock("image")]), ["empty:url", "empty:alt"]);
    assert.deepEqual(codes([{ id: "1", type: "actions", buttons: [] }]), ["empty:buttons"]);
  });

  test("필드 10개 · 블록 50개 경계", () => {
    const f = (n: number): EditorBlock => ({ id: "1", type: "fields", fields: Array(n).fill("x") });
    assert.deepEqual(codes([f(10)]), []);
    assert.deepEqual(codes([f(11)]), ["tooMany:fields"]);
    const many = (n: number) => Array.from({ length: n }, (): EditorBlock => ({ id: "d", type: "divider" }));
    assert.deepEqual(codes(many(50)), []);
    assert.deepEqual(codes(many(51)), ["tooManyBlocks:"]);
  });

  test("URL 형식 · action_id 중복", () => {
    assert.deepEqual(
      codes([{ id: "1", type: "image", url: "ftp://a", alt: "x", title: "" }]),
      ["badUrl:url"],
    );
    assert.deepEqual(
      codes([
        {
          id: "1",
          type: "actions",
          buttons: [newButton({ text: "a", actionId: "go" }), newButton({ text: "b", actionId: "go" })],
        },
      ]),
      ["dupActionId:button.actionId"],
    );
  });

  test("대체 텍스트 비었거나 4,000자 초과면 경고", () => {
    const d: EditorBlock[] = [{ id: "1", type: "divider" }];
    assert.deepEqual(validate(d, " ").map((i) => [i.code, i.severity]), [["fallbackEmpty", "warn"]]);
    assert.deepEqual(validate(d, "a".repeat(4001)).map((i) => i.code), ["fallbackLong"]);
  });

  test("템플릿은 ko/en 모두 경고 없이 통과", () => {
    for (const id of TEMPLATE_IDS) {
      for (const lang of ["ko", "en"] as const) {
        const model = template(id, lang);
        assert.deepEqual(validate(model, autoFallback(model)), [], `${id}/${lang}`);
      }
    }
  });
});

/* ── 코드 왕복 검사 ─────────────────────────────────────────── */

const TRICKY: EditorBlock[] = [
  { id: "1", type: "header", text: `It's "live" 🚀 배포` },
  { id: "2", type: "text", text: "back\\slash 'single' \"double\"\n줄바꿈 & <@U1> $HOME `cmd`" },
  { id: "3", type: "actions", buttons: [newButton({ text: "O'Reilly", actionId: "a'b", value: "{\"k\":1}" })] },
];
const PAYLOAD: Payload = buildPayload(TRICKY, `fallback with ' and "`);

/** 셸 작은따옴표 인용을 푼다 ('\'' → ') */
function unshell(code: string): string {
  const m = /--data '([\s\S]*)'$/.exec(code);
  assert.ok(m, "--data 인자가 있어야 한다");
  return m[1].replace(/'\\''/g, "'");
}

/** Python 리터럴을 JSON 으로 되돌린다: 문자열 밖의 True/False/None 과 끝 쉼표만 바꾼다 */
function pyToJson(src: string): unknown {
  let out = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      let j = i + 1;
      while (src[j] !== '"') j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j;
    } else if (src.startsWith("True", i)) {
      out += "true";
      i += 3;
    } else if (src.startsWith("False", i)) {
      out += "false";
      i += 4;
    } else if (src.startsWith("None", i)) {
      out += "null";
      i += 3;
    } else out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[\]}])/g, "$1"));
}

describe("buildCode 왕복", () => {
  test("JSON: 전체 페이로드와 blocks 만", () => {
    assert.deepEqual(JSON.parse(buildCode("json", PAYLOAD)), PAYLOAD);
    assert.deepEqual(JSON.parse(buildCode("json", PAYLOAD, { blocksOnly: true })), { blocks: PAYLOAD.blocks });
  });

  test("curl chat.postMessage: 셸 인용을 풀면 channel + 페이로드", () => {
    const code = buildCode("curl", PAYLOAD, { channel: "C999" });
    assert.ok(code.includes('Bearer $SLACK_BOT_TOKEN"'));
    assert.deepEqual(JSON.parse(unshell(code)), { channel: "C999", ...PAYLOAD });
  });

  test("curl 채널을 비우면 자리표시값", () => {
    const code = buildCode("curl", PAYLOAD, { channel: "  " });
    assert.equal((JSON.parse(unshell(code)) as { channel: string }).channel, CHANNEL_PLACEHOLDER);
  });

  test("Webhook: 채널 없이 페이로드만", () => {
    const code = buildCode("webhook", PAYLOAD);
    assert.ok(code.includes('"$SLACK_WEBHOOK_URL"'));
    assert.deepEqual(JSON.parse(unshell(code)), PAYLOAD);
  });

  test("shellQuote: 작은따옴표만 끊어 잇는다", () => {
    assert.equal(shellQuote("a'b"), "'a'\\''b'");
  });

  test("Node.js: 객체 리터럴의 blocks · text · channel", () => {
    const code = buildCode("node", PAYLOAD, { channel: "C1" });
    assert.ok(code.includes("process.env.SLACK_BOT_TOKEN"));
    const m = /blocks: ([\s\S]*),\n\}\);/.exec(code);
    assert.ok(m);
    assert.deepEqual(JSON.parse(m[1]), PAYLOAD.blocks);
    assert.ok(code.includes(`text: ${JSON.stringify(PAYLOAD.text)},`));
    assert.ok(code.includes(`channel: "C1",`));
  });

  test("Python: dict 리터럴을 되돌리면 blocks 와 같다 (True 포함)", () => {
    const code = buildCode("python", PAYLOAD, { channel: "C1" });
    assert.ok(code.includes('os.environ["SLACK_BOT_TOKEN"]'));
    assert.ok(code.includes('"emoji": True'));
    const m = /blocks=([\s\S]*),\n\)/.exec(code);
    assert.ok(m);
    assert.deepEqual(pyToJson(m[1]), PAYLOAD.blocks);
  });

  test("모든 탭이 빈 메시지에서도 코드를 만든다", () => {
    const empty = buildPayload([], "");
    for (const tab of CODE_TABS) assert.ok(buildCode(tab.id, empty).length > 0, tab.id);
  });
});
