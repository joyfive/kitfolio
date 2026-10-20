/* ============================================================
   슬랙 메시지 빌더: mrkdwn 처리

   - escapeMrkdwn: 일반 텍스트의 & < > 만 바꾸고, 슬랙 토큰(<@U..>, <#C..>,
     <!here>, <!date^..>, <https://..|..>)은 그대로 둔다.
   - parseMrkdwn: 미리보기용 간이 파서. 슬랙 클라이언트 렌더의 근사치다.
   - toPlainText: 대체 텍스트(text)용으로 서식 기호를 걷어낸다.
   ============================================================ */

/** 슬랙이 특수 처리하는 꺾쇠 토큰 */
const TOKEN_RE =
  /<(?:[@#!][^<>\s|]+(?:\|[^<>]*)?|(?:https?:\/\/|mailto:)[^<>\s|]+(?:\|[^<>]*)?)>/g;

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 꺾쇠 토큰 안의 표시 텍스트(| 뒤)도 이스케이프 대상이다 */
function escapeToken(token: string): string {
  const inner = token.slice(1, -1);
  const bar = inner.indexOf("|");
  if (bar === -1) return token;
  const label = inner.slice(bar + 1).replace(/&/g, "&amp;");
  return `<${inner.slice(0, bar)}|${label}>`;
}

/** 줄 앞 인용 기호 `>` 는 이스케이프하지 않는다 (슬랙이 `&gt;` 를 인용으로 보지 않음) */
export function escapeMrkdwn(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const quote = /^>\s?/.exec(line);
      const head = quote ? quote[0] : "";
      return head + escapeLine(line.slice(head.length));
    })
    .join("\n");
}

function escapeLine(line: string): string {
  let out = "";
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    out += escapeText(line.slice(last, m.index));
    out += escapeToken(m[0]);
    last = m.index + m[0].length;
  }
  return out + escapeText(line.slice(last));
}

/* ── 미리보기 파서 ─────────────────────────────────────────── */

export type Inline =
  | { t: "text"; v: string }
  | { t: "code"; v: string }
  | { t: "b" | "i" | "s"; c: Inline[] }
  | { t: "link"; href: string; label: string }
  | { t: "mention"; v: string };

export type Line =
  | { t: "pre"; v: string }
  | { t: "quote"; c: Inline[] }
  | { t: "line"; c: Inline[] };

const INLINE_RE =
  /(`[^`\n]+`)|(<[^<>\n]+>)|(\*[^*\n]+\*)|(_[^_\n]+_)|(~[^~\n]+~)/;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let rest = s;
  while (rest) {
    const m = INLINE_RE.exec(rest);
    if (!m) {
      out.push({ t: "text", v: rest });
      break;
    }
    if (m.index > 0) out.push({ t: "text", v: rest.slice(0, m.index) });
    const tok = m[0];
    const inner = tok.slice(1, -1);
    if (m[1]) out.push({ t: "code", v: inner });
    else if (m[2]) out.push(parseToken(inner));
    else out.push({ t: m[3] ? "b" : m[4] ? "i" : "s", c: parseInline(inner) });
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

function parseToken(inner: string): Inline {
  const bar = inner.indexOf("|");
  const head = bar === -1 ? inner : inner.slice(0, bar);
  const label = bar === -1 ? "" : inner.slice(bar + 1);
  if (head.startsWith("@")) return { t: "mention", v: label ? `@${label}` : head };
  if (head.startsWith("#")) return { t: "mention", v: label ? `#${label}` : head };
  if (head.startsWith("!date^")) return { t: "text", v: label || head };
  if (head.startsWith("!")) {
    const name = head.slice(1).split("^")[0];
    return { t: "mention", v: `@${name}` };
  }
  if (/^(https?:\/\/|mailto:)/.test(head)) return { t: "link", href: head, label: label || head };
  return { t: "text", v: `<${inner}>` };
}

export function parseMrkdwn(src: string): Line[] {
  // 홀수 번째 조각이 코드 블록이다. 닫히지 않은 마지막 조각은 일반 텍스트로 본다.
  const parts = src.split("```");
  const segs: { code: boolean; v: string }[] = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1 && i < parts.length - 1) segs.push({ code: true, v: part });
    else {
      const v = (i % 2 === 1 ? "```" : "") + part;
      const prev = segs[segs.length - 1];
      if (prev && !prev.code) prev.v += v;
      else segs.push({ code: false, v });
    }
  });

  const out: Line[] = [];
  segs.forEach((seg, i) => {
    if (seg.code) {
      out.push({ t: "pre", v: seg.v.replace(/^\n/, "").replace(/\n$/, "") });
      return;
    }
    let text = seg.v;
    // 코드 블록 바로 앞뒤의 줄바꿈 하나는 펜스에 붙은 것으로 본다
    if (segs[i - 1]?.code) text = text.replace(/^\n/, "");
    if (segs[i + 1]?.code) text = text.replace(/\n$/, "");
    if (text === "" && segs.length > 1) return;
    for (const line of text.split("\n")) {
      const q = /^>\s?/.exec(line);
      if (q) out.push({ t: "quote", c: parseInline(line.slice(q[0].length)) });
      else out.push({ t: "line", c: parseInline(line) });
    }
  });
  return out;
}

/* ── 대체 텍스트 ───────────────────────────────────────────── */

/** mrkdwn 서식을 걷어낸 사람이 읽는 텍스트 */
export function toPlainText(src: string): string {
  return src
    .replace(/```/g, "")
    .replace(/<([^<>\n]+)>/g, (_, inner: string) => {
      const tok = parseToken(inner);
      if (tok.t === "link") return tok.label;
      if (tok.t === "mention" || tok.t === "text") return tok.v;
      return inner;
    })
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/~([^~\n]+)~/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
