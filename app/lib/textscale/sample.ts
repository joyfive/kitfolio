/* ============================================================
   텍스트 확대·간격 검사기: 내장 예시 (기획서 4.3)

   세 프리셋에서 서로 다른 문제가 드러나도록 설계했다.
   - 텍스트 200%  : 고정 높이 + overflow: hidden 때문에 하단 기능이 잘린다
   - 리플로 320px : 고정 너비 560px 때문에 가로 오버플로가 생긴다
   - 텍스트 간격  : 문장과 버튼 영역이 늘어나 카드 높이를 넘는다

   영문 예시는 같은 구조·CSS 를 유지하고 문장만 자연스러운 영어로 바꾼다.
   ============================================================ */
import type { Lang } from "../content";

const HTML_KO = `<section class="summary-card">
  <p class="eyebrow">PROJECT STATUS</p>
  <h2>접근성 검수 준비가 완료되었습니다</h2>
  <p>
    배포 전 텍스트 확대, 좁은 화면 리플로와 사용자 지정 간격에서도
    모든 설명과 기능이 유지되는지 확인하세요.
  </p>
  <div class="actions">
    <button type="button">검수 결과 저장</button>
    <a href="#details">세부 항목 확인</a>
  </div>
</section>`;

const HTML_EN = `<section class="summary-card">
  <p class="eyebrow">PROJECT STATUS</p>
  <h2>This release is ready for accessibility review</h2>
  <p>
    Before you ship, confirm that every description and control survives
    enlarged text, a narrow reflow viewport, and user spacing overrides.
  </p>
  <div class="actions">
    <button type="button">Save review results</button>
    <a href="#details">Open detailed checks</a>
  </div>
</section>`;

const CSS = `.summary-card {
  box-sizing: border-box;
  width: 560px;
  height: 230px;
  overflow: hidden;
  padding: 24px;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  font-family: Arial, sans-serif;
}

.summary-card h2 {
  margin: 8px 0;
  font-size: 24px;
  line-height: 1.2;
}

.summary-card p {
  margin: 6px 0;
}

.actions {
  display: flex;
  gap: 12px;
  white-space: nowrap;
}`;

export function sampleHtml(lang: Lang): string {
  return lang === "en" ? HTML_EN : HTML_KO;
}

export function sampleCss(): string {
  return CSS;
}
