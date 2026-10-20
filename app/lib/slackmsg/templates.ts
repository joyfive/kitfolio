/* ============================================================
   슬랙 메시지 빌더: 시작 템플릿 (ko/en)

   빈 에디터로 시작하지 않도록 첫 진입 시 배포 알림을 채운다.
   멘션·채널 ID 는 실제 값이 아닌 자리표시값이다.
   ============================================================ */
import type { Lang } from "../content";
import { newButton, uid, type EditorBlock } from "./model";

export type TemplateId = "deploy" | "incident" | "release";

export const TEMPLATE_IDS: TemplateId[] = ["deploy", "incident", "release"];

export function template(id: TemplateId, lang: Lang): EditorBlock[] {
  const ko = lang === "ko";
  switch (id) {
    case "deploy":
      return [
        { id: uid(), type: "header", text: ko ? "v2.4.0 배포 완료" : "v2.4.0 deployed" },
        {
          id: uid(),
          type: "text",
          text: ko
            ? "*production* 환경에 배포되었습니다. 변경 사항은 아래 링크에서 확인하세요."
            : "Deployed to *production*. See the changes at the link below.",
        },
        {
          id: uid(),
          type: "fields",
          fields: ko
            ? ["*환경*\nproduction", "*버전*\n`v2.4.0`", "*배포자*\n<@U0123456789>", "*소요 시간*\n4분 12초"]
            : ["*Environment*\nproduction", "*Version*\n`v2.4.0`", "*Deployed by*\n<@U0123456789>", "*Duration*\n4m 12s"],
        },
        {
          id: uid(),
          type: "actions",
          buttons: [
            newButton({
              text: ko ? "변경 사항 보기" : "View changes",
              url: "https://github.com/acme/app/releases/tag/v2.4.0",
              style: "primary",
            }),
            newButton({ text: ko ? "롤백" : "Roll back", actionId: "rollback", value: "v2.3.9", style: "danger" }),
          ],
        },
        {
          id: uid(),
          type: "context",
          text: ko ? "GitHub Actions · deploy.yml" : "GitHub Actions · deploy.yml",
        },
      ];
    case "incident":
      return [
        { id: uid(), type: "header", text: ko ? "장애 발생: 결제 API 응답 지연" : "Incident: payment API latency" },
        {
          id: uid(),
          type: "textButton",
          text: ko
            ? "<!here> 결제 API p95 응답 시간이 *3초*를 넘었습니다.\n담당자: <@U0123456789>"
            : "<!here> Payment API p95 latency is above *3s*.\nOn call: <@U0123456789>",
          button: newButton({ text: ko ? "대시보드 열기" : "Open dashboard", url: "https://grafana.example.com/d/payments" }),
        },
        { id: uid(), type: "divider" },
        {
          id: uid(),
          type: "fields",
          fields: ko
            ? ["*심각도*\nSEV2", "*시작*\n14:05 KST", "*영향*\n카드 결제 일부 실패", "*채널*\n<#C0123456789>"]
            : ["*Severity*\nSEV2", "*Started*\n05:05 UTC", "*Impact*\nSome card payments fail", "*Channel*\n<#C0123456789>"],
        },
        {
          id: uid(),
          type: "actions",
          buttons: [
            newButton({ text: ko ? "확인함" : "Acknowledge", actionId: "incident_ack", value: "INC-1042", style: "primary" }),
            newButton({ text: ko ? "해결됨" : "Resolve", actionId: "incident_resolve", value: "INC-1042" }),
          ],
        },
      ];
    case "release":
      return [
        { id: uid(), type: "header", text: ko ? "이번 주 릴리즈 노트" : "This week's release notes" },
        {
          id: uid(),
          type: "text",
          text: ko
            ? "*새 기능*\n• 팀 단위 알림 설정\n• CSV 내보내기에 날짜 범위 추가\n\n*수정*\n• 모바일에서 검색창이 가려지던 문제"
            : "*New*\n• Team-level notification settings\n• Date range for CSV export\n\n*Fixed*\n• Search bar hidden on mobile",
        },
        { id: uid(), type: "divider" },
        {
          id: uid(),
          type: "context",
          text: ko
            ? "자세한 내용은 <https://example.com/changelog|변경 로그>에서 확인하세요."
            : "Read the full <https://example.com/changelog|changelog>.",
        },
      ];
  }
}
