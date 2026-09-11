/* ============================================================
   HTML 접근성 검사기: 내장 예시 HTML

   의도적으로 다음 문제를 담고 있다 (기획서 4.3):
     html 의 lang 누락 · 비어 있는 title · h1 다음 h3 로 건너뛴 헤딩 ·
     img 의 alt 누락 · 존재하지 않는 id 를 가리키는 label[for] ·
     이름 신호가 없는 입력 필드 · 보이는 문구가 이름에 없는 버튼 ·
     이름 신호가 없는 링크 · 양수 tabindex

   영문 예시는 같은 구조와 같은 문제를 유지하고 텍스트만 영어로 바꾼다.
   ============================================================ */
import type { Lang } from "../content";

const KO = `<!doctype html>
<html>
  <head><title></title></head>
  <body>
    <header>
      <nav><a href="/">홈</a></nav>
    </header>
    <main>
      <h1>계정 설정</h1>
      <h3>프로필</h3>
      <img src="profile.jpg">
      <label for="email-address">이메일</label>
      <input id="email" placeholder="이메일">
      <button aria-label="저장">변경 내용 저장</button>
      <a href="/delete" tabindex="2"></a>
    </main>
  </body>
</html>`;

const EN = `<!doctype html>
<html>
  <head><title></title></head>
  <body>
    <header>
      <nav><a href="/">Home</a></nav>
    </header>
    <main>
      <h1>Account settings</h1>
      <h3>Profile</h3>
      <img src="profile.jpg">
      <label for="email-address">Email</label>
      <input id="email" placeholder="Email">
      <button aria-label="Save">Save changes</button>
      <a href="/delete" tabindex="2"></a>
    </main>
  </body>
</html>`;

/** 예시는 전체 문서 모드로 불러온다 */
export const SAMPLE_SCOPE = "document" as const;

export function sampleHtml(lang: Lang): string {
  return lang === "en" ? EN : KO;
}
