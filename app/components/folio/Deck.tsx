"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** 1920×1080 고정 슬라이드를 컨테이너 너비에 맞춰 transform: scale 로 축소 */
export default function Deck({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.4);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setFit(Math.min(1, el.clientWidth / 1920));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="pf-deck" style={{ "--fit": fit } as CSSProperties}>
      {children}
    </div>
  );
}

export function Slide({ kind, children }: { kind?: string; children: ReactNode }) {
  return (
    <div className="pf-slide-frame">
      <section className={`pf-slide${kind ? ` pf-slide--${kind}` : ""}`}>{children}</section>
    </div>
  );
}

/** 고정 폭 문서(A4 960px)를 컨테이너 폭에 맞춰 zoom 으로 축소. zoom 은 레이아웃 높이도 함께 줄인다. */
export function FitZoom({ width, children }: { width: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZ(Math.min(1, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className="fb-zoom" style={{ "--z": z } as CSSProperties}>
      {children}
    </div>
  );
}
