/* ============================================================
   슬랙 메시지 빌더: Block Kit 제한값 검사

   값은 Slack 공식 문서(docs.slack.dev Block Kit 레퍼런스 · chat.postMessage)
   기준이며 sources.ts 의 검증일과 함께 관리한다. 한도를 넘어도 코드는 만들고
   경고로만 알린다 (생성을 막지 않는다).
   ============================================================ */
import type { EditorBlock, EditorButton } from "./model";
import { escapeMrkdwn } from "./mrkdwn";

export const LIMITS = {
  /** 메시지당 블록 (모달·App Home 은 100) */
  blocks: 50,
  sectionText: 3000,
  fields: 10,
  fieldText: 2000,
  headerText: 150,
  /** context 블록의 텍스트 객체 (mrkdwn 텍스트 객체 한도) */
  contextText: 3000,
  actionsElements: 25,
  buttonText: 75,
  actionId: 255,
  buttonValue: 2000,
  url: 3000,
  altText: 2000,
  imageTitle: 2000,
  /** 최상위 text 권장 길이. 하드 한도(40,000)를 넘으면 슬랙이 자른다 */
  fallbackText: 4000,
} as const;

export type IssueCode =
  | "tooManyBlocks"
  | "empty"
  | "tooLong"
  | "tooMany"
  | "badUrl"
  | "dupActionId"
  | "fallbackEmpty"
  | "fallbackLong";

export type Issue = {
  /** 블록 순번 (0부터). 메시지 전체에 대한 경고면 null */
  block: number | null;
  code: IssueCode;
  /** 문제 필드: text · fields · alt · url · button.text … */
  field?: string;
  limit?: number;
  actual?: number;
  /** error: 슬랙이 거부한다 · warn: 보내지지만 권장과 다르다 */
  severity: "error" | "warn";
};

const isHttpUrl = (u: string) => /^https?:\/\/[^\s]+$/i.test(u);

function checkLen(
  issues: Issue[],
  block: number,
  field: string,
  value: string,
  limit: number,
  required = true,
) {
  if (required && !value.trim()) issues.push({ block, code: "empty", field, severity: "error" });
  else if (value.length > limit)
    issues.push({ block, code: "tooLong", field, limit, actual: value.length, severity: "error" });
}

function checkButton(issues: Issue[], block: number, b: EditorButton, prefix: string) {
  checkLen(issues, block, `${prefix}text`, b.text, LIMITS.buttonText);
  if (b.url) {
    if (!isHttpUrl(b.url)) issues.push({ block, code: "badUrl", field: `${prefix}url`, severity: "error" });
    else checkLen(issues, block, `${prefix}url`, b.url, LIMITS.url);
  }
  checkLen(issues, block, `${prefix}actionId`, b.actionId, LIMITS.actionId, false);
  checkLen(issues, block, `${prefix}value`, b.value, LIMITS.buttonValue, false);
}

export function validate(model: EditorBlock[], fallback: string): Issue[] {
  const issues: Issue[] = [];
  if (model.length > LIMITS.blocks)
    issues.push({ block: null, code: "tooManyBlocks", limit: LIMITS.blocks, actual: model.length, severity: "error" });

  model.forEach((b, i) => {
    switch (b.type) {
      case "text":
        checkLen(issues, i, "text", escapeMrkdwn(b.text), LIMITS.sectionText);
        break;
      case "header":
        checkLen(issues, i, "text", b.text, LIMITS.headerText);
        break;
      case "divider":
        break;
      case "fields":
        if (b.fields.length > LIMITS.fields)
          issues.push({ block: i, code: "tooMany", field: "fields", limit: LIMITS.fields, actual: b.fields.length, severity: "error" });
        b.fields.forEach((f) => checkLen(issues, i, "fields", escapeMrkdwn(f), LIMITS.fieldText));
        break;
      case "context":
        checkLen(issues, i, "text", escapeMrkdwn(b.text), LIMITS.contextText);
        break;
      case "image":
        if (!b.url.trim()) issues.push({ block: i, code: "empty", field: "url", severity: "error" });
        else if (!isHttpUrl(b.url)) issues.push({ block: i, code: "badUrl", field: "url", severity: "error" });
        else checkLen(issues, i, "url", b.url, LIMITS.url);
        checkLen(issues, i, "alt", b.alt, LIMITS.altText);
        checkLen(issues, i, "title", b.title, LIMITS.imageTitle, false);
        break;
      case "actions": {
        if (b.buttons.length === 0) issues.push({ block: i, code: "empty", field: "buttons", severity: "error" });
        if (b.buttons.length > LIMITS.actionsElements)
          issues.push({ block: i, code: "tooMany", field: "buttons", limit: LIMITS.actionsElements, actual: b.buttons.length, severity: "error" });
        b.buttons.forEach((btn) => checkButton(issues, i, btn, "button."));
        // action_id 는 같은 블록 안에서 고유해야 한다
        const seen = new Set<string>();
        for (const btn of b.buttons) {
          if (!btn.actionId) continue;
          if (seen.has(btn.actionId))
            issues.push({ block: i, code: "dupActionId", field: "button.actionId", severity: "error" });
          seen.add(btn.actionId);
        }
        break;
      }
      case "textButton":
        checkLen(issues, i, "text", escapeMrkdwn(b.text), LIMITS.sectionText);
        checkButton(issues, i, b.button, "button.");
        break;
    }
  });

  if (!fallback.trim()) issues.push({ block: null, code: "fallbackEmpty", severity: "warn" });
  else if (fallback.length > LIMITS.fallbackText)
    issues.push({ block: null, code: "fallbackLong", limit: LIMITS.fallbackText, actual: fallback.length, severity: "warn" });

  return issues;
}
