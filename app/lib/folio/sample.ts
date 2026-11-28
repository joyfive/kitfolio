/* ============================================================
   예시 문서: 처음 방문했을 때와 "예시로 채우기"에 쓴다.

   인물·회사·수치는 모두 가상이다. 실제 사람이나 회사의 이력을 넣지 않는다.
   ============================================================ */
import type { DocLang, SourceDoc, Workspace } from "./types";
import { makeEntry } from "./storage";

const PROFILE: Record<DocLang, SourceDoc> = {
  ko: {
    name: "홍길동",
    contact: [
      { value: "gildong.hong@example.com" },
      { value: "010-0000-0000" },
      { value: "portfolio.example.com", strong: true },
    ],
    total_experience: "총 6년 4개월",
    lead: "운영의 반복 작업을 **구조로 바꾸는** 서비스 기획자입니다.",
    paragraphs: [
      "커머스와 핀테크에서 정산·주문 백오피스를 기획했습니다. 현업 인터뷰로 실제 흐름을 먼저 그리고, 정책과 데이터 구조를 함께 설계해 개발팀이 같은 그림을 보게 만드는 일을 잘합니다.",
    ],
    career: [
      {
        company: "온길커머스",
        period: "2022.03~재직 중",
        role: "프로덕트 매니저 · 주문·정산 백오피스",
        bullets: [
          "판매자 정산 시스템 리뉴얼 기획, 정산 오류 문의 월 120건 → 30건",
          "주문 상태값 표준화와 운영 어드민 권한 체계 설계",
        ],
      },
      {
        company: "모아핀테크",
        period: "2019.07~2022.02",
        role: "서비스 기획자 · 고객센터 어드민",
        bullets: ["상담 이력 통합 화면 기획, 평균 처리 시간 18% 단축", "VOC 분류 체계 설계와 주간 리포트 자동화"],
      },
    ],
    education: { school: "가상대학교 경영학과", period: "2013.03~2019.02", detail: "학사 졸업 · 정보시스템 부전공" },
    etc: [
      { title: "사내 기획 스터디 운영", detail: ["2023~2024 · 격주 12회, 정책 문서 템플릿 정리"] },
      { year: 2024, items: ["사내 혁신상 · 정산 리뉴얼 프로젝트"] },
    ],
  },
  en: {
    name: "Gildong Hong",
    contact: [
      { value: "gildong.hong@example.com" },
      { value: "+1 555 0100" },
      { value: "portfolio.example.com", strong: true },
    ],
    total_experience: "6 years 4 months",
    lead: "A product manager who turns repetitive operations work **into durable systems**.",
    paragraphs: [
      "I have planned settlement and order back-office products in commerce and fintech. I start by mapping how people actually work, then design the policy and the data model together so engineering and operations share one picture.",
    ],
    career: [
      {
        company: "Northway Commerce",
        period: "Mar 2022 - present",
        role: "Product Manager · Orders & Settlement",
        bullets: [
          "Led the seller settlement rebuild: settlement tickets down from 120 to 30 a month",
          "Standardized order statuses and designed role-based admin permissions",
        ],
      },
      {
        company: "Moa Fintech",
        period: "Jul 2019 - Feb 2022",
        role: "Product Planner · Support Admin",
        bullets: ["Unified the customer history view, cutting average handling time by 18%", "Designed a VoC taxonomy and automated the weekly report"],
      },
    ],
    education: { school: "Example University, Business Administration", period: "2013-2019", detail: "BBA · Minor in Information Systems" },
    etc: [
      { title: "Internal product study group", detail: ["2023-2024 · 12 sessions, built a policy doc template"] },
      { year: 2024, items: ["Company Innovation Award · Settlement rebuild"] },
    ],
  },
};

const RESUME: Record<DocLang, SourceDoc> = {
  ko: {
    company_name: "새솔랩",
    primary: "#2D5DC8",
    headline: "Product Manager · 백오피스 / 운영 시스템",
    capabilities: [
      { title: "정산·주문 시스템 설계", desc: "사업자 유형별 정산 정책 분기, 상태값 모델링, 대사 플로우 설계" },
      { title: "운영 효율화", desc: "반복 수작업을 어드민 기능으로 전환, 입력 포맷 표준화" },
      { title: "협업 리딩", desc: "재무·CS·개발 사이 요구사항 조율, 정책 문서 단일화" },
    ],
    skills: [
      { k: "협업 도구", v: "Jira, Confluence, Figma, Notion" },
      { k: "데이터", v: "SQL 기초 조회, Looker Studio 대시보드" },
    ],
    projects: [
      {
        title: "판매자 정산 시스템 리뉴얼",
        company: "온길커머스",
        period: "2024.02~2024.07",
        contribution: 80,
        role: "현업 인터뷰로 정산 흐름을 다시 그리고, 정산 정책과 엔티티 구조를 설계했습니다.",
        problem: [
          "판매자 유형(법인·개인사업자·개인)마다 세금 처리가 달라 수기 보정이 반복됨",
          "정산 기준이 문서마다 달라 문의 대응에 시간이 걸림",
        ],
        solution: [
          { text: "판매자 유형별 정산 정책 분기 설계", children: ["법인·개인사업자: 세금계산서 발행", "개인: 원천징수 후 지급"] },
          "정산 대상·항목·지급 내역의 관계를 정의한 데이터 구조 설계",
        ],
        result: "정산 오류 문의 **월 120건 → 30건**, 수기 보정 업무 제거",
      },
    ],
  },
  en: {
    company_name: "Brightleaf Labs",
    primary: "#2D5DC8",
    headline: "Product Manager · Back-office & Operations",
    capabilities: [
      { title: "Settlement & order systems", desc: "Policy branching by seller type, status modeling, reconciliation flows" },
      { title: "Operational efficiency", desc: "Turning repetitive manual work into admin features and standard input formats" },
      { title: "Cross-team leadership", desc: "Aligning finance, support and engineering on one source of policy" },
    ],
    skills: [
      { k: "Collaboration", v: "Jira, Confluence, Figma, Notion" },
      { k: "Data", v: "Basic SQL, Looker Studio dashboards" },
    ],
    projects: [
      {
        title: "Seller settlement rebuild",
        company: "Northway Commerce",
        period: "Feb 2024 - Jul 2024",
        contribution: 80,
        role: "Re-mapped the settlement flow through interviews and designed the settlement policy and entity model.",
        problem: [
          "Tax handling differed by seller type, forcing repeated manual corrections",
          "Settlement rules varied between documents, slowing down support replies",
        ],
        solution: [
          { text: "Designed settlement policy branches by seller type", children: ["Companies: issue tax invoices", "Individuals: withhold tax before payout"] },
          "Defined the data model linking payees, settlement items and payouts",
        ],
        result: "Settlement tickets **down from 120 to 30 a month**, manual corrections removed",
      },
    ],
  },
};

const DIAGRAM: Record<DocLang, string> = {
  ko: `flowchart LR
  A[주문] --> B[정산 규칙]
  B --> C[지급 원장]
  C --> D[명세서]`,
  en: `flowchart LR
  A[Orders] --> B[Settlement rules]
  B --> C[Payout ledger]
  C --> D[Statement]`,
};

const PORTFOLIO: Record<DocLang, SourceDoc> = {
  ko: {
    company_name: "새솔랩",
    primary: "#2D5DC8",
    title: "흩어진 운영을 하나의 흐름으로",
    headline: "Product Manager",
    philosophy: [
      { title: "현업의 실제 흐름부터 그린다", desc: "문서보다 사람이 일하는 순서를 먼저 확인합니다." },
      { title: "정책과 데이터를 함께 설계한다", desc: "규칙이 데이터 구조에 담겨야 운영이 흔들리지 않습니다." },
    ],
    working_style: ["결정은 문서로 남기고 공유합니다", "작게 출시하고 지표로 확인합니다"],
    peer_review: {
      title: "동료 평가",
      source: "2024 하반기 360 리뷰",
      metrics: [
        { label: "문제 정의", value: 92 },
        { label: "협업", value: 88 },
      ],
      quotes: ["복잡한 정책을 개발팀이 바로 쓸 수 있는 구조로 정리해 줍니다."],
    },
    capabilities: [
      { title: "정산·주문 시스템 설계", desc: "정책 분기와 상태값을 데이터 구조로 설계합니다." },
      { title: "운영 효율화", desc: "반복 수작업을 기능으로 바꿉니다." },
    ],
    overview: [{ title: "운영 문제를 구조로 해결한 경험", desc: "정산 오류의 원인을 정책과 데이터에서 찾았습니다.", projects: [{ no: 1 }] }],
    projects: [
      {
        title: "판매자 정산 시스템 리뉴얼",
        period: "2024.02~2024.07",
        contribution: "80%",
        overview: {
          headline: "정산 기준을 **하나의 정책**으로 묶었습니다",
          background: "판매자 유형이 늘면서 정산 기준이 문서마다 달라졌습니다.",
          problem: "수기 보정과 정산 문의가 매달 반복되었습니다.",
          solution: "유형별 정책 분기와 정산 데이터 구조를 새로 설계했습니다.",
          result: "정산 문의 75% 감소, 수기 보정 제거",
        },
        problem: {
          background: ["판매자 1,200곳 · 유형 3가지", "정산 담당자 2명이 매주 수기 보정"],
          cards: [
            { title: "기준 불일치", desc: "같은 판매자도 담당자마다 다르게 계산" },
            { title: "추적 불가", desc: "지급액의 근거를 화면에서 확인할 수 없음" },
          ],
          takeaway: "문제는 계산이 아니라 **기준이 여러 곳에 있다는 것**이었습니다.",
        },
        solutions: [
          {
            sections: [
              { title: "정산 데이터 흐름", desc: "주문에서 명세서까지 한 방향으로 흐르게 바꿨습니다.", element: { type: "diagram", code: DIAGRAM.ko } },
            ],
            takeaway: "모든 지급액이 정산 규칙 하나로 설명됩니다.",
          },
        ],
        outcome: {
          collaboration: ["재무팀·CS팀 인터뷰 8회 진행", "정책 문서를 하나로 통합"],
          results: [
            { label: "월 정산 문의", from: "120건", value: "30건" },
            { label: "수기 보정", value: "0건" },
          ],
          lesson: "정책을 바꿀 때는 데이터 구조부터 합의해야 다시 흩어지지 않습니다.",
        },
      },
    ],
    ending: ["운영의 반복을 줄이는 기획으로", "새솔랩의 다음 성장을 돕겠습니다."],
  },
  en: {
    company_name: "Brightleaf Labs",
    primary: "#2D5DC8",
    title: "Turning scattered operations into one flow",
    headline: "Product Manager",
    philosophy: [
      { title: "Map the real workflow first", desc: "I check how people actually work before reading the documents." },
      { title: "Design policy and data together", desc: "Rules need to live in the data model to stay consistent." },
    ],
    working_style: ["Write decisions down and share them", "Ship small and check the metrics"],
    peer_review: {
      title: "Peer review",
      source: "H2 2024 360 review",
      metrics: [
        { label: "Problem framing", value: 92 },
        { label: "Collaboration", value: 88 },
      ],
      quotes: ["Turns complex policy into a structure engineering can use right away."],
    },
    capabilities: [
      { title: "Settlement & order systems", desc: "Designs policy branches and statuses as a data model." },
      { title: "Operational efficiency", desc: "Turns repetitive manual work into product features." },
    ],
    overview: [{ title: "Solving operations problems with structure", desc: "Traced settlement errors back to policy and data.", projects: [{ no: 1 }] }],
    projects: [
      {
        title: "Seller settlement rebuild",
        period: "Feb 2024 - Jul 2024",
        contribution: "80%",
        overview: {
          headline: "One **settlement policy** instead of many",
          background: "As seller types grew, settlement rules drifted between documents.",
          problem: "Manual corrections and settlement tickets repeated every month.",
          solution: "Redesigned policy branches by seller type and the settlement data model.",
          result: "75% fewer settlement tickets, no manual corrections",
        },
        problem: {
          background: ["1,200 sellers · 3 seller types", "Two staff correcting payouts by hand every week"],
          cards: [
            { title: "Inconsistent rules", desc: "The same seller was calculated differently by different staff" },
            { title: "No audit trail", desc: "Payout amounts could not be traced on screen" },
          ],
          takeaway: "The problem was not the math but **rules living in many places**.",
        },
        solutions: [
          {
            sections: [
              { title: "Settlement data flow", desc: "Made data move one way, from orders to statements.", element: { type: "diagram", code: DIAGRAM.en } },
            ],
            takeaway: "Every payout can be explained by one rule set.",
          },
        ],
        outcome: {
          collaboration: ["Ran 8 interviews with finance and support", "Merged policy into a single document"],
          results: [
            { label: "Monthly settlement tickets", from: "120", value: "30" },
            { label: "Manual corrections", value: "0" },
          ],
          lesson: "Agree on the data model before changing policy, or the rules drift apart again.",
        },
      },
    ],
    ending: ["I would like to bring this kind of planning", "to Brightleaf Labs."],
  },
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const sampleProfile = (lang: DocLang): SourceDoc => clone(PROFILE[lang]);
export const sampleResume = (lang: DocLang): SourceDoc => clone(RESUME[lang]);
export const samplePortfolio = (lang: DocLang): SourceDoc => clone(PORTFOLIO[lang]);

/** 빈 새 문서: 회사명과 강조색만 */
export const blankDoc = (lang: DocLang): SourceDoc => ({
  company_name: lang === "ko" ? "새 지원처" : "New company",
  primary: "#2D5DC8",
});

/** 첫 방문 기본 작업공간: 예시 프로필 + 두 도구 예시 문서 하나씩 */
export function sampleWorkspace(lang: DocLang): Workspace {
  const r = makeEntry(sampleResume(lang), lang);
  const p = makeEntry(samplePortfolio(lang), lang);
  return {
    schemaVersion: 1,
    profile: sampleProfile(lang),
    resume: [r],
    portfolio: [p],
    active: { resume: r.id, portfolio: p.id },
  };
}
