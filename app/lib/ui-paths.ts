/* ============================================================
   외부 서비스 메뉴 경로 상수 (프롬프트 글 전용 단일 출처)

   프롬프트 글은 "claude.ai 설정의 어디에 붙여 넣는다"처럼 다른 서비스의
   메뉴 경로를 자주 안내한다. 이 경로는 해당 서비스가 화면을 바꾸면 틀어지므로,
   글 본문에 직접 쓰지 않고 이 파일에 한 번만 적는다.

   ── 글에서 쓰는 법 ───────────────────────────────────────
   본문에 {{ui:<id>}} 토큰을 쓰면 렌더할 때 해당 언어의 경로로 바뀐다.
     예) {{ui:claude-instructions}} 칸에 붙여 넣으세요.
   - 없는 id 를 쓰면 렌더가 실패한다 (빌드 실패 · npm test 실패).
   - 글의 언어에 해당하는 경로가 없어도 실패한다 (EN 글에서 ko 만 있는 id 사용 등).
   - 글 하단에 "메뉴 경로 확인일"이 자동으로 붙는다: 글이 쓴 경로 중 가장 오래된 verifiedAt.

   ── 메뉴가 바뀌었을 때 ───────────────────────────────────
   해당 항목의 ko/en 문자열과 verifiedAt 만 고치면 그 경로를 쓰는 모든 글에 반영된다.
   verifiedAt 은 "실제 화면에서 경로를 눈으로 확인한 날"이다. 추측으로 갱신하지 않는다.

   표기 규칙: 단계 구분은 "›" (U+203A). 화면에 보이는 메뉴 이름을 그대로 쓴다.
   ============================================================ */

export type UiPath = {
  /** 이 경로가 속한 서비스 (글 하단 확인일 안내에 쓰인다) */
  service: string;
  ko?: string;
  en?: string;
  /** 실제 화면에서 경로를 확인한 날짜 (YYYY-MM-DD) */
  verifiedAt: string;
  /** 확인한 사람·방법 메모 (화면 미노출) */
  note?: string;
};

export const UI_PATHS: Record<string, UiPath> = {
  "claude-instructions": {
    service: "claude.ai",
    ko: "설정 › 당신의 Claude › 지침",
    verifiedAt: "2026-11-19",
    note: "운영자 작성 샘플 기준. EN 화면 경로는 확인 전이라 비워 둠.",
  },
};

/** {{ui:<id>}} 토큰 (id 는 소문자·숫자·하이픈) */
export const UI_TOKEN = /\{\{ui:([a-z0-9-]+)\}\}/g;

export type UiPathUse = { id: string; service: string; verifiedAt: string };

/**
 * 본문의 {{ui:<id>}} 토큰을 해당 언어 경로로 바꾸고, 쓰인 경로 목록을 돌려준다.
 * 없는 id · 해당 언어 경로가 없는 id 는 예외를 던진다 (조용히 빈칸으로 두지 않는다).
 */
export function resolveUiPaths(
  md: string,
  lang: "ko" | "en",
  where = "",
): { text: string; used: UiPathUse[] } {
  const used = new Map<string, UiPathUse>();
  const text = md.replace(UI_TOKEN, (_, id: string) => {
    const p = UI_PATHS[id];
    if (!p) throw new Error(`${where}: 알 수 없는 메뉴 경로 토큰 {{ui:${id}}} (app/lib/ui-paths.ts 에 없음)`);
    const label = p[lang];
    if (!label) throw new Error(`${where}: {{ui:${id}}} 의 ${lang} 경로가 비어 있음`);
    used.set(id, { id, service: p.service, verifiedAt: p.verifiedAt });
    return label;
  });
  return { text, used: [...used.values()] };
}
