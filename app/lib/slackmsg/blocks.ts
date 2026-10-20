/* ============================================================
   슬랙 메시지 빌더: 에디터 모델 → Block Kit JSON

   출력은 section + mrkdwn 을 기본으로 한다. 웹훅·구형 클라이언트·라이브러리
   예제와 호환되고 JSON 이 짧다. 입력을 고쳐서 내보내지 않는다: 빈 값이나
   한도 초과도 그대로 직렬화하고 limits.ts 가 경고로 알린다.
   ============================================================ */
import type { EditorBlock, EditorButton } from "./model";
import { escapeMrkdwn, toPlainText } from "./mrkdwn";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type BlockJson = { [k: string]: Json };
export type Payload = { text: string; blocks: BlockJson[] };

/** 대체 텍스트 자동 생성 길이 */
export const AUTO_FALLBACK_MAX = 150;

const plain = (text: string): BlockJson => ({ type: "plain_text", text, emoji: true });
const mrkdwn = (text: string): BlockJson => ({ type: "mrkdwn", text: escapeMrkdwn(text) });

export function buttonJson(b: EditorButton): BlockJson {
  const out: BlockJson = { type: "button", text: plain(b.text) };
  if (b.url) out.url = b.url;
  if (b.actionId) out.action_id = b.actionId;
  if (b.value) out.value = b.value;
  if (b.style) out.style = b.style;
  return out;
}

export function blockJson(b: EditorBlock): BlockJson {
  switch (b.type) {
    case "text":
      return { type: "section", text: mrkdwn(b.text) };
    case "header":
      return { type: "header", text: plain(b.text) };
    case "divider":
      return { type: "divider" };
    case "fields":
      return { type: "section", fields: b.fields.map(mrkdwn) };
    case "context":
      return { type: "context", elements: [mrkdwn(b.text)] };
    case "image": {
      const out: BlockJson = { type: "image", image_url: b.url, alt_text: b.alt };
      if (b.title) out.title = plain(b.title);
      return out;
    }
    case "actions":
      return { type: "actions", elements: b.buttons.map(buttonJson) };
    case "textButton":
      return { type: "section", text: mrkdwn(b.text), accessory: buttonJson(b.button) };
  }
}

export function toBlocks(model: EditorBlock[]): BlockJson[] {
  return model.map(blockJson);
}

/** 블록에서 읽을 수 있는 첫 문구를 모아 알림용 대체 텍스트를 만든다 */
export function autoFallback(model: EditorBlock[]): string {
  const pieces: string[] = [];
  for (const b of model) {
    let s = "";
    if (b.type === "header") s = b.text;
    else if (b.type === "text" || b.type === "textButton") s = toPlainText(b.text);
    else if (b.type === "fields") s = b.fields.map(toPlainText).filter(Boolean).join(" · ");
    if (s.trim()) pieces.push(s.trim());
    if (pieces.length === 2) break;
  }
  const joined = pieces.join(" · ");
  return joined.length > AUTO_FALLBACK_MAX
    ? joined.slice(0, AUTO_FALLBACK_MAX - 1).trimEnd() + "…"
    : joined;
}

export function buildPayload(model: EditorBlock[], text: string): Payload {
  return { text, blocks: toBlocks(model) };
}
