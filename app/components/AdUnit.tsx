"use client";

/* ============================================================
   Kitfolio — AdSense 광고 단위(슬롯) 컴포넌트

   로더 스크립트는 app/layout.tsx 에서 이미 전 페이지에 로드됨.
   이 컴포넌트는 <ins class="adsbygoogle"> 를 렌더하고 mount 시 1회 push.

   사용 예:
     import AdUnit from "@/app/components/AdUnit";
     <AdUnit slot="1234567890" />                  // 반응형 자동
     <AdUnit slot="1234567890" format="rectangle" responsive={false} />

   슬롯 ID는 AdSense 승인 후 "광고 단위 만들기"에서 발급됩니다.
   개발 환경(NODE_ENV !== production)에서는 광고를 호출하지 않고
   위치를 가늠할 수 있는 플레이스홀더만 표시합니다.
   ============================================================ */
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT = "ca-pub-7537584957079478";

type AdUnitProps = {
  /** AdSense 광고 단위 슬롯 ID (data-ad-slot) */
  slot: string;
  /** data-ad-format: "auto" | "fluid" | "rectangle" 등 */
  format?: string;
  /** data-full-width-responsive */
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className,
  style,
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return; // dev: 광고 호출 안 함
    if (pushed.current) return; // StrictMode 중복 push 방지
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense 미로드/미승인 시 무시 */
    }
  }, []);

  // 개발 환경: 광고 위치 플레이스홀더
  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 90,
          border: "1px dashed var(--color-blue-gray-300)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-blue-gray-50)",
          color: "var(--color-blue-gray-400)",
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          ...style,
        }}
        aria-hidden
      >
        광고 영역 · slot {slot} (개발 미리보기)
      </div>
    );
  }

  return (
    <ins
      className={"adsbygoogle" + (className ? " " + className : "")}
      style={{ display: "block", ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
