"use client";

import { useEffect, useRef, useState } from "react";
import { clampChroma, formatHex } from "culori";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useT, type Dict } from "../lib/i18n";

// 컨트롤 마이크로카피(필드·버튼 라벨)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "grad.type": "타입",
    "grad.angle": "각도",
    "grad.position": "중심 위치",
    "grad.stops": "색상 정지점",
    "grad.addStop": "정지점 추가",
    "grad.css": "CSS",
    "grad.random": "랜덤",
    "grad.reverse": "반전",
  },
  en: {
    "grad.type": "Type",
    "grad.angle": "Angle",
    "grad.position": "Center",
    "grad.stops": "Color Stops",
    "grad.addStop": "Add stop",
    "grad.css": "CSS",
    "grad.random": "Random",
    "grad.reverse": "Reverse",
  },
};

type GType = "linear" | "radial" | "conic";
type Stop = { color: string; pos: number };

const MID_COLORS = ["#6486ef", "#3a70eb", "#a7b6f6", "#18377c", "#c4cdf9"];

/** 전체 색상에서 랜덤하되 보기 좋은 그라디언트 stop 생성.
 *  - 랜덤 베이스 hue에서 조화로운 방향으로 hue를 이동(analogous~triadic 범위)
 *  - OKLCH 명도를 밝음→어두움으로 펼쳐 대비 확보, 채도는 선명한 구간 유지
 *  - clampChroma로 sRGB 게멋에 맞춰 깨지지 않게 보정 */
function randomPrettyStops(): { color: string; pos: number }[] {
  const baseHue = Math.random() * 360;
  const n = Math.random() < 0.5 ? 2 : 3; // 2~3 stop
  const spread = 30 + Math.random() * 100; // 전체 hue 이동폭(도)
  const dir = Math.random() < 0.5 ? 1 : -1; // 시계/반시계
  const lHi = 0.74 + Math.random() * 0.12; // 밝은 끝 명도
  const lLo = 0.46 + Math.random() * 0.12; // 어두운 끝 명도
  const chroma = 0.13 + Math.random() * 0.07; // 선명도
  const flip = Math.random() < 0.5; // 밝음↔어두움 방향 랜덤
  return Array.from({ length: n }, (_, i) => {
    const tt = i / (n - 1);
    const h = (baseHue + dir * spread * tt + 360) % 360;
    const lt = flip ? 1 - tt : tt;
    const l = lHi + (lLo - lHi) * lt;
    const hex = formatHex(clampChroma({ mode: "oklch", l, c: chroma, h }, "oklch"))!;
    return { color: hex, pos: Math.round(tt * 100) };
  });
}

export default function CssGradient() {
  const t = useT(DICT);

  const [type, setType] = useState<GType>("linear");
  const [angle, setAngle] = useState(135);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#899ff3", pos: 0 },
    { color: "#22499f", pos: 100 },
  ]);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);
  const dialDragRef = useRef(false);

  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopStr = sorted
    .map((s) => `${s.color} ${Math.round(s.pos)}%`)
    .join(", ");

  function gradientStr() {
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopStr})`;
    if (type === "radial")
      return `radial-gradient(circle at ${posX}% ${posY}%, ${stopStr})`;
    return `conic-gradient(from ${angle}deg at ${posX}% ${posY}%, ${stopStr})`;
  }
  const trackGradient = `linear-gradient(90deg, ${stopStr})`;

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (dragRef.current !== null && trackRef.current) {
        const r = trackRef.current.getBoundingClientRect();
        const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
        const i = dragRef.current;
        setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, pos: p } : s)));
      }
      if (dialDragRef.current && dialRef.current) {
        const r = dialRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const a =
          (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
        setAngle(Math.round((a + 360) % 360));
      }
    }
    function onUp() {
      dragRef.current = null;
      dialDragRef.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function sampleAt(p: number) {
    for (let i = 0; i < sorted.length - 1; i++) {
      if (p >= sorted[i].pos && p <= sorted[i + 1].pos) return sorted[i].color;
    }
    return sorted[sorted.length - 1].color;
  }

  function onTrackMouseDown(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    const stopEl = target.closest<HTMLElement>(".stop");
    if (stopEl) {
      const i = Number(stopEl.dataset.i);
      setSelected(i);
      dragRef.current = i;
      e.preventDefault();
      return;
    }
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    setStops((prev) => {
      const next = [...prev, { color: sampleAt(p), pos: p }];
      dragRef.current = next.length - 1;
      setSelected(next.length - 1);
      return next;
    });
  }

  function addStop() {
    let gap = -1;
    let at = 50;
    for (let i = 0; i < sorted.length - 1; i++) {
      const d = sorted[i + 1].pos - sorted[i].pos;
      if (d > gap) {
        gap = d;
        at = (sorted[i].pos + sorted[i + 1].pos) / 2;
      }
    }
    const color = MID_COLORS[Math.floor(Math.random() * MID_COLORS.length)];
    setStops((prev) => {
      const next = [...prev, { color, pos: at }];
      setSelected(next.length - 1);
      return next;
    });
  }

  function updateStop(i: number, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function deleteStop(i: number) {
    setStops((prev) => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, idx) => idx !== i);
      setSelected((sel) => Math.max(0, Math.min(sel, next.length - 1)));
      return next;
    });
  }

  function random() {
    setStops(randomPrettyStops());
    setAngle(Math.floor(Math.random() * 360));
    setSelected(0);
  }
  function reverse() {
    setStops((prev) => prev.map((s) => ({ color: s.color, pos: 100 - s.pos })));
  }

  function dialFromEvent(e: React.MouseEvent) {
    if (!dialRef.current) return;
    const r = dialRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const a = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
    setAngle(Math.round((a + 360) % 360));
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText("background: " + gradientStr() + ";");
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const geomLabel =
    type === "linear"
      ? t("grad.angle")
      : type === "conic"
        ? t("grad.angle") + " · " + t("grad.position")
        : t("grad.position");

  const g = gradientStr();

  return (
    <>
      <PageHead slug="css-gradient" />

      <div className="cv-work">
          {/* 인풋(컨트롤) — 좌측 화이트 패널 */}
          <div className="cv-panel">
            <div className="panel-inner">
              {/* type */}
              <div className="field-group">
                <span className="field-label">{t("grad.type")}</span>
                <div className="type-seg">
                  {(["linear", "radial", "conic"] as GType[]).map((tp) => (
                    <button
                      key={tp}
                      className={type === tp ? "is-active" : ""}
                      onClick={() => setType(tp)}
                    >
                      {tp[0].toUpperCase() + tp.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* angle / position */}
              <div className="field-group">
                <span className="field-label">{geomLabel}</span>
                {type !== "radial" && (
                  <div className="dial-row">
                    <div
                      className="dial"
                      ref={dialRef}
                      onMouseDown={(e) => {
                        dialDragRef.current = true;
                        dialFromEvent(e);
                        e.preventDefault();
                      }}
                    >
                      <div
                        className="needle"
                        style={{
                          transform: `translate(-50%,-100%) rotate(${angle}deg)`,
                        }}
                      />
                      <div className="hub" />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                    />
                    <span className="slider-val">{angle}°</span>
                  </div>
                )}
                {type !== "linear" && (
                  <div>
                    <div className="slider-row">
                      <label>X</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={posX}
                        onChange={(e) => setPosX(Number(e.target.value))}
                      />
                      <span className="slider-val">{posX}%</span>
                    </div>
                    <div className="slider-row">
                      <label>Y</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={posY}
                        onChange={(e) => setPosY(Number(e.target.value))}
                      />
                      <span className="slider-val">{posY}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* stops */}
              <div className="field-group">
                <span className="field-label">{t("grad.stops")}</span>
                <div className="track-wrap">
                  <div
                    className="track"
                    ref={trackRef}
                    style={{ background: trackGradient }}
                    onMouseDown={onTrackMouseDown}
                  >
                    {stops.map((s, i) => (
                      <div
                        key={i}
                        className={"stop" + (i === selected ? " sel" : "")}
                        data-i={i}
                        style={{ left: s.pos + "%", background: s.color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="stops">
                  {stops.map((s, i) => (
                    <div
                      key={i}
                      className={"stop-row" + (i === selected ? " sel" : "")}
                      onMouseDown={(e) => {
                        if (!(e.target as HTMLElement).closest("button"))
                          setSelected(i);
                      }}
                    >
                      <span className="swatch" style={{ background: s.color }}>
                        <input
                          type="color"
                          value={s.color}
                          onChange={(e) =>
                            updateStop(i, { color: e.target.value })
                          }
                        />
                      </span>
                      <input
                        className="hex-in"
                        type="text"
                        value={s.color.toUpperCase()}
                        maxLength={7}
                        onChange={(e) => {
                          let v = e.target.value.trim();
                          if (!v.startsWith("#")) v = "#" + v;
                          if (/^#[0-9a-fA-F]{6}$/.test(v))
                            updateStop(i, { color: v });
                        }}
                      />
                      <input
                        className="pos-in"
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(s.pos)}
                        onChange={(e) =>
                          updateStop(i, {
                            pos: Math.max(
                              0,
                              Math.min(100, Number(e.target.value) || 0),
                            ),
                          })
                        }
                      />
                      <span
                        style={{
                          color: "var(--color-blue-gray-400)",
                          fontSize: 12,
                        }}
                      >
                        %
                      </span>
                      <button
                        className="stop-del"
                        disabled={stops.length <= 2}
                        aria-label="remove"
                        onClick={() => deleteStop(i)}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="add-stop" onClick={addStop}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  <span>{t("grad.addStop")}</span>
                </button>
              </div>

              {/* output */}
              <div className="field-group">
                <span className="field-label">{t("grad.css")}</span>
                <div className="css-out">
                  <button
                    className="btn btn-sm btn-ghost copy-css"
                    onClick={copyCss}
                    style={
                      copied
                        ? { color: "var(--color-blue-primary-700)" }
                        : undefined
                    }
                  >
                    {copied ? t("common.copied") : t("common.copy")}
                  </button>
                  <pre>
                    <span className="ct-prop">background</span>:{" "}
                    <span className="ct-fn">{g}</span>;
                  </pre>
                </div>
                <div className="out-actions">
                  <button className="btn btn-sm btn-outline" onClick={random}>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <circle cx="5" cy="5" r="1.2" fill="currentColor" />
                      <circle cx="11" cy="5" r="1.2" fill="currentColor" />
                      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                      <circle cx="5" cy="11" r="1.2" fill="currentColor" />
                      <circle cx="11" cy="11" r="1.2" fill="currentColor" />
                    </svg>
                    <span>{t("grad.random")}</span>
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={reverse}>
                    <span>{t("grad.reverse")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 출력(프리뷰) — 우측 그레이 영역 */}
          <div className="cv-canvas">
            <div className="preview" style={{ background: g }} />
          </div>
      </div>

      <Faq slug="css-gradient" />
      <RelatedTools slug="css-gradient" />
    </>
  );
}
