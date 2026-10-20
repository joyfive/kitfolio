/* ============================================================
   슬랙 메시지 빌더: API 호출 코드 생성

   토큰은 입력받지 않는다. 모든 코드는 환경 변수(SLACK_BOT_TOKEN ·
   SLACK_WEBHOOK_URL)를 읽는다. 함수 본문은 고정이고 페이로드만 입력에서
   들어간다. 언어마다 문자열 규칙이 달라 직렬화를 따로 하며, 테스트가 각
   코드에서 페이로드를 다시 읽어 원래 값과 같은지 대조한다.
   ============================================================ */
import type { Json, Payload } from "./blocks";

export type CodeTab = "json" | "curl" | "node" | "python" | "webhook";

export const CODE_TABS: { id: CodeTab; label: string }[] = [
  { id: "json", label: "JSON" },
  { id: "curl", label: "curl" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "webhook", label: "Webhook" },
];

/** 채널 ID 를 비워 두면 이 자리표시값을 넣는다 */
export const CHANNEL_PLACEHOLDER = "C0123456789";

/** 셸 작은따옴표 인용: ' 는 '\'' 로 끊어 잇는다 */
export function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

/** JSON 을 들여쓰고 첫 줄을 뺀 나머지 줄에 추가 들여쓰기를 붙인다 */
function indentJson(value: Json, extra: string): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n" + extra);
}

/** Python 리터럴. 문자열은 JSON 이스케이프가 Python 큰따옴표 문자열과 호환된다 */
export function pyLiteral(value: Json, indent = 0): string {
  const pad = "    ".repeat(indent + 1);
  const end = "    ".repeat(indent);
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return "[\n" + value.map((v) => pad + pyLiteral(v, indent + 1)).join(",\n") + ",\n" + end + "]";
  }
  const keys = Object.keys(value);
  if (keys.length === 0) return "{}";
  return (
    "{\n" +
    keys.map((k) => `${pad}${JSON.stringify(k)}: ${pyLiteral(value[k], indent + 1)}`).join(",\n") +
    ",\n" +
    end +
    "}"
  );
}

export function payloadJson(payload: Payload, blocksOnly: boolean): string {
  return JSON.stringify(blocksOnly ? { blocks: payload.blocks } : payload, null, 2);
}

function curl(payload: Payload, channel: string): string {
  const body = JSON.stringify({ channel, ...payload }, null, 2);
  return `curl -X POST https://slack.com/api/chat.postMessage \\
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \\
  -H "Content-type: application/json; charset=utf-8" \\
  --data ${shellQuote(body)}`;
}

function webhook(payload: Payload): string {
  const body = JSON.stringify(payload, null, 2);
  return `curl -X POST "$SLACK_WEBHOOK_URL" \\
  -H "Content-type: application/json; charset=utf-8" \\
  --data ${shellQuote(body)}`;
}

function node(payload: Payload, channel: string): string {
  return `import { WebClient } from "@slack/web-api";

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

const result = await client.chat.postMessage({
  channel: ${JSON.stringify(channel)},
  text: ${JSON.stringify(payload.text)},
  blocks: ${indentJson(payload.blocks, "  ")},
});

console.log(result.ts);`;
}

function python(payload: Payload, channel: string): string {
  return `import os
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

response = client.chat_postMessage(
    channel=${JSON.stringify(channel)},
    text=${JSON.stringify(payload.text)},
    blocks=${pyLiteral(payload.blocks, 1)},
)

print(response["ts"])`;
}

export function buildCode(
  tab: CodeTab,
  payload: Payload,
  opts: { channel?: string; blocksOnly?: boolean } = {},
): string {
  const channel = opts.channel?.trim() || CHANNEL_PLACEHOLDER;
  switch (tab) {
    case "json":
      return payloadJson(payload, !!opts.blocksOnly);
    case "curl":
      return curl(payload, channel);
    case "node":
      return node(payload, channel);
    case "python":
      return python(payload, channel);
    case "webhook":
      return webhook(payload);
  }
}

/** 공식 Block Kit Builder 로 열기: JSON 은 URL 해시에만 실린다 */
export function blockKitBuilderUrl(payload: Payload): string {
  return "https://app.slack.com/block-kit-builder/#" + encodeURIComponent(JSON.stringify({ blocks: payload.blocks }));
}
