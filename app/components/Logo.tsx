/** Kitfolio 브랜드 심볼 (2×2 그리드: 좌상단 K 글리프 + 회색조 라운드 사각형 3개).
 *  헤더·푸터·로딩 등에서 공유. 크기는 className(CSS width/height)으로 제어. */
export function LogoMark({
  className = "kf-logomark",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path
        d="M1 7V1H2.76471V3.15858H3.58824L5.02353 1H6.92941L5.14118 3.78698L7 7H5.07059L3.6 4.55385H2.76471V7H1Z"
        fill="#50535E"
      />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="#D4D9E5" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="#9B9FAB" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="#737782" />
    </svg>
  );
}
