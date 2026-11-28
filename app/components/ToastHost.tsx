"use client";

import { useEffect, useRef } from "react";
import { dismissToast, useToasts, type ToastItem } from "../lib/toast";

function Icon({ kind }: { kind: ToastItem["kind"] }) {
  const common = { width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", "aria-hidden": true as const };
  if (kind === "success")
    return (
      <svg {...common}><circle cx="10" cy="10" r="10" fill="currentColor" opacity=".18" /><path d="M5.8 10.3l2.8 2.8 5.6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
    );
  if (kind === "error")
    return (
      <svg {...common}><circle cx="10" cy="10" r="10" fill="currentColor" opacity=".18" /><path d="M10 5.6v5.2M10 13.6v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    );
  if (kind === "warning")
    return (
      <svg {...common}><path d="M10 2.6l8 14H2l8-14z" fill="currentColor" opacity=".18" /><path d="M10 7.6v4M10 14v.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
    );
  return (
    <svg {...common}><circle cx="10" cy="10" r="10" fill="currentColor" opacity=".18" /><path d="M10 9v5M10 6.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  );
}

function ToastView({ item }: { item: ToastItem }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => dismissToast(item.id), item.duration);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  const isAlert = item.kind === "error";
  return (
    <div
      className={`kf-toast is-${item.kind}`}
      role={isAlert ? "alert" : "status"}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <span className="kf-toast-icon"><Icon kind={item.kind} /></span>
      <span className="kf-toast-msg">{item.message}</span>
      <button type="button" className="kf-toast-close" aria-label="닫기 / Close" onClick={() => dismissToast(item.id)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

/** 루트 레이아웃에서 한 번만 렌더. 모든 상태·에러·완료 알림이 여기로 모인다. */
export default function ToastHost() {
  const items = useToasts();
  return (
    <div className="kf-toasts" aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
    </div>
  );
}
