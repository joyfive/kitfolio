/* ============================================================
   슬랙 메시지 빌더: 에디터 모델

   에디터 블록 하나가 Block Kit 블록 하나에 1:1 대응한다.
   텍스트는 사용자가 입력한 mrkdwn 원문(이스케이프 전)을 그대로 들고 있고,
   이스케이프는 blocks.ts 에서 직렬화할 때 한 번만 한다.
   ============================================================ */

export type ButtonStyle = "" | "primary" | "danger";

export type EditorButton = {
  id: string;
  text: string;
  /** 있으면 링크 버튼 */
  url: string;
  actionId: string;
  value: string;
  style: ButtonStyle;
};

export type EditorBlock =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "header"; text: string }
  | { id: string; type: "divider" }
  | { id: string; type: "fields"; fields: string[] }
  | { id: string; type: "context"; text: string }
  | { id: string; type: "image"; url: string; alt: string; title: string }
  | { id: string; type: "actions"; buttons: EditorButton[] }
  | { id: string; type: "textButton"; text: string; button: EditorButton };

export type BlockType = EditorBlock["type"];

export const BLOCK_TYPES: BlockType[] = [
  "text",
  "header",
  "divider",
  "fields",
  "context",
  "image",
  "actions",
  "textButton",
];

let seq = 0;
/** 에디터 내부 키 (React key 용). JSON 에는 나가지 않는다. */
export function uid(prefix = "b"): string {
  seq += 1;
  return `${prefix}${seq}`;
}

export function newButton(partial: Partial<EditorButton> = {}): EditorButton {
  return { id: uid("btn"), text: "", url: "", actionId: "", value: "", style: "", ...partial };
}

export function newBlock(type: BlockType): EditorBlock {
  const id = uid();
  switch (type) {
    case "text":
      return { id, type, text: "" };
    case "header":
      return { id, type, text: "" };
    case "divider":
      return { id, type };
    case "fields":
      return { id, type, fields: ["", ""] };
    case "context":
      return { id, type, text: "" };
    case "image":
      return { id, type, url: "", alt: "", title: "" };
    case "actions":
      return { id, type, buttons: [newButton()] };
    case "textButton":
      return { id, type, text: "", button: newButton() };
  }
}
