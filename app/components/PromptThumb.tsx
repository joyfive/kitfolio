/**
 * 제목으로 그리는 썸네일 (이미지 파일 없음).
 * 같은 제목이 카드 본문 h2 에도 있으므로 보조기기에는 숨긴다.
 * 공유용 OG 이미지(promptOgImage)도 같은 규칙: 제목 + 배지.
 */
export default function PromptThumb({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="kf-blog-cover kf-prompt-thumb" aria-hidden>
      <span className="kf-prompt-thumb-title">{title}</span>
      <span className="kf-prompt-thumb-badge">{badge}</span>
    </div>
  );
}
