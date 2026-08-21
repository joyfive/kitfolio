"use client";

/* ============================================================
   Kitfolio: 쿠팡 파트너스 배너 (푸터)

   쿠팡 파트너스 위젯은 원래 g.js 스크립트가 document.write 로
   iframe 을 삽입하는 방식이라 Next.js(SSR/CSR) 에서는 그대로 쓰면
   삽입 위치를 못 잡는다. 위젯이 실제로 렌더하는 것은
   ads-partners.coupang.com/widgets.html iframe 이므로,
   동일 파라미터로 iframe 을 직접 렌더한다(가장 안정적).

   ⚠️ 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
      제공받을 수 있음을 고지해야 한다.
   ============================================================ */

const COUPANG = {
  id: 1014830,
  template: "carousel",
  trackingCode: "AF6721987",
  width: 320,
  height: 60,
  tsource: "",
} as const;

const SRC =
  "https://ads-partners.coupang.com/widgets.html?" +
  `id=${COUPANG.id}` +
  `&template=${COUPANG.template}` +
  `&trackingCode=${COUPANG.trackingCode}` +
  `&subId=` +
  `&width=${COUPANG.width}` +
  `&height=${COUPANG.height}` +
  `&tsource=${COUPANG.tsource}`;

export default function CoupangBanner({ lang }: { lang: "ko" | "en" }) {
  return (
    <div className="foot-coupang" aria-label="Coupang Partners">
      <iframe
        src={SRC}
        width={COUPANG.width}
        height={COUPANG.height}
        frameBorder={0}
        scrolling="no"
        referrerPolicy="unsafe-url"
        title="Coupang Partners"
        loading="lazy"
      />
      <p className="foot-coupang-notice">
        {lang === "ko"
          ? "쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
          : "As a Coupang Partners member, we may earn a commission from qualifying purchases."}
      </p>
    </div>
  );
}
