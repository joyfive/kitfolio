/* ============================================================
   슬랙 메시지 빌더: 공식 출처 · 검증일

   limits.ts 의 제한값과 mrkdwn 규칙의 근거다. 화면에 노출되는 출처는
   이 파일이 단일 출처이며, content.ts 의 레지스트리가 여기서 가져다 쓴다.
   ============================================================ */

/** limits.ts 제한값을 Slack 공식 문서와 마지막으로 대조한 날짜 */
export const SLACKMSG_VERIFIED_AT = "2026-10-20";

/** 공식 출처: Slack 개발자 문서만 */
export const SLACKMSG_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: { ko: "Slack 개발자 문서 · Block Kit 블록 레퍼런스", en: "Slack Developer Docs · Block Kit blocks reference" },
    url: "https://docs.slack.dev/reference/block-kit/blocks/",
  },
  {
    label: { ko: "Slack 개발자 문서 · 버튼 요소", en: "Slack Developer Docs · Button element" },
    url: "https://docs.slack.dev/reference/block-kit/block-elements/button-element/",
  },
  {
    label: { ko: "Slack 개발자 문서 · 텍스트 서식(mrkdwn)", en: "Slack Developer Docs · Formatting message text (mrkdwn)" },
    url: "https://docs.slack.dev/messaging/formatting-message-text/",
  },
  {
    label: { ko: "Slack 개발자 문서 · chat.postMessage", en: "Slack Developer Docs · chat.postMessage" },
    url: "https://docs.slack.dev/reference/methods/chat.postMessage/",
  },
  {
    label: { ko: "Slack 개발자 문서 · Incoming Webhooks", en: "Slack Developer Docs · Incoming webhooks" },
    url: "https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/",
  },
];
