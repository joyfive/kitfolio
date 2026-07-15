"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import QrToolTabs from "./QrToolTabs";
import { useT, type Dict } from "../lib/i18n";
import { createQrMatrix, type QrErrorLevel, type QrMatrix } from "../lib/qr/createQrMatrix";
import { modulePath, SHAPE_ORDER, type QrModuleShape } from "../lib/qr/qrShapes";
import {
  crispCanvasSize,
  renderQrCanvas,
  type QrRenderOptions,
} from "../lib/qr/renderQrCanvas";
import { renderQrSvg } from "../lib/qr/renderQrSvg";
import { validateQrOutput } from "../lib/qr/validateQrOutput";
import { normalizeUrl } from "../lib/qr/url";

// 컨트롤 마이크로카피만 로컬 dict. 페이지 콘텐츠(제목·설명·FAQ)는 content.ts.
const DICT: Dict = {
  ko: {
    "g.url": "URL",
    "g.urlPh": "https://example.com",
    "g.quality": "인식 품질",
    "g.q.M": "일반",
    "g.q.Q": "높음",
    "g.q.H": "최고",
    "g.res": "PNG 해상도",
    "g.shape": "데이터 셀 모양",
    "g.s.square": "사각형",
    "g.s.circle": "원형",
    "g.s.diamond": "마름모",
    "g.s.heart": "하트",
    "g.s.arch": "아치형",
    "g.fg": "QR 색상",
    "g.bg": "배경 색상",
    "g.png": "PNG 다운로드",
    "g.svg": "SVG 다운로드",
    "g.preview": "QR 코드 미리보기",
    "g.contrast": "색상 대비가 낮아 인식이 어려울 수 있습니다.",
    "g.st.empty": "URL을 입력하면 QR 코드가 표시됩니다.",
    "g.st.invalid": "유효한 http 또는 https URL을 입력해 주세요.",
    "g.st.validating": "QR 코드 인식을 확인하고 있습니다.",
    "g.st.ok": "이 브라우저에서 QR 코드 인식을 확인했습니다.",
    "g.st.fail":
      "현재 설정으로 QR 코드를 읽지 못했습니다. 색상 대비를 높이거나 인식 품질을 변경해 주세요.",
  },
  en: {
    "g.url": "URL",
    "g.urlPh": "https://example.com",
    "g.quality": "Recognition quality",
    "g.q.M": "Normal",
    "g.q.Q": "High",
    "g.q.H": "Maximum",
    "g.res": "PNG resolution",
    "g.shape": "Data cell shape",
    "g.s.square": "Square",
    "g.s.circle": "Circle",
    "g.s.diamond": "Diamond",
    "g.s.heart": "Heart",
    "g.s.arch": "Arch",
    "g.fg": "QR color",
    "g.bg": "Background color",
    "g.png": "Download PNG",
    "g.svg": "Download SVG",
    "g.preview": "QR code preview",
    "g.contrast": "Low color contrast may reduce scannability.",
    "g.st.empty": "Enter a URL to preview the QR code.",
    "g.st.invalid": "Enter a valid http or https URL.",
    "g.st.validating": "Checking that the QR code is readable…",
    "g.st.ok": "Verified readable in this browser.",
    "g.st.fail":
      "Couldn't read the QR code with the current settings. Increase color contrast or change the recognition quality.",
  },
};

const LEVELS: QrErrorLevel[] = ["M", "Q", "H"];
const RESOLUTIONS = [512, 1024, 2048] as const;

type GenStatus = "empty" | "invalid" | "validating" | "ok" | "fail";

/* 상대 휘도 기반 대비비 (WCAG) — 낮으면 경고 */
function relLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const int = parseInt(m[1], 16);
  const ch = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
    const u = v / 255;
    return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

function isHex6(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

/** 모양 미리보기 아이콘 — 실제 shape 지오메트리 재사용 (아치형도 정확) */
function ShapeIcon({ shape }: { shape: QrModuleShape }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden focusable="false">
      <path d={modulePath(shape, 3, 3, 14)} fill="currentColor" />
    </svg>
  );
}

export default function QrCodeGenerator() {
  const t = useT(DICT);

  const [url, setUrl] = useState("");
  const [level, setLevel] = useState<QrErrorLevel>("Q");
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>(1024);
  const [shape, setShape] = useState<QrModuleShape>("square");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#FFFFFF");
  const [fgText, setFgText] = useState("#000000");
  const [bgText, setBgText] = useState("#FFFFFF");

  const [status, setStatus] = useState<GenStatus>("empty");
  const previewRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<QrMatrix | null>(null);
  const normalizedRef = useRef<string | null>(null);
  const runToken = useRef(0);

  const opts: QrRenderOptions = useMemo(() => ({ shape, fg, bg }), [shape, fg, bg]);

  const lowContrast = useMemo(() => contrastRatio(fg, bg) < 3, [fg, bg]);

  // URL·모양·색상·품질 변경 시 debounce 후 생성 + 자체 판독 검증
  useEffect(() => {
    const token = ++runToken.current;
    const timer = setTimeout(async () => {
      const trimmed = url.trim();
      if (!trimmed) {
        matrixRef.current = null;
        normalizedRef.current = null;
        setStatus("empty");
        return;
      }
      const normalized = normalizeUrl(trimmed);
      if (!normalized) {
        matrixRef.current = null;
        normalizedRef.current = null;
        setStatus("invalid");
        return;
      }
      setStatus("validating");
      try {
        const matrix = await createQrMatrix(normalized, level);
        if (token !== runToken.current) return;
        matrixRef.current = matrix;
        normalizedRef.current = normalized;
        // 미리보기 렌더 (크리스프 크기 → CSS 로 축소)
        if (previewRef.current) {
          const size = crispCanvasSize(matrix.size, 512);
          renderQrCanvas(previewRef.current, matrix, opts, size);
        }
        const ok = await validateQrOutput(matrix, opts, normalized);
        if (token !== runToken.current) return;
        setStatus(ok ? "ok" : "fail");
      } catch {
        if (token !== runToken.current) return;
        matrixRef.current = null;
        setStatus("fail");
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [url, level, opts]);

  const canDownload = status === "ok" && matrixRef.current !== null;

  const triggerDownload = useCallback((href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const downloadPng = useCallback(() => {
    const matrix = matrixRef.current;
    if (!matrix || status !== "ok") return;
    const size = crispCanvasSize(matrix.size, resolution);
    const canvas = document.createElement("canvas");
    renderQrCanvas(canvas, matrix, opts, size);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const href = URL.createObjectURL(blob);
      triggerDownload(href, "kitfolio-qr-code.png");
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    }, "image/png");
  }, [status, resolution, opts, triggerDownload]);

  const downloadSvg = useCallback(() => {
    const matrix = matrixRef.current;
    if (!matrix || status !== "ok") return;
    const svg = renderQrSvg(matrix, opts);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    triggerDownload(href, "kitfolio-qr-code.svg");
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }, [status, opts, triggerDownload]);

  function onFgText(v: string) {
    let next = v.trim();
    if (next && !next.startsWith("#")) next = "#" + next;
    setFgText(next);
    if (isHex6(next)) setFg(next);
  }
  function onBgText(v: string) {
    let next = v.trim();
    if (next && !next.startsWith("#")) next = "#" + next;
    setBgText(next);
    if (isHex6(next)) setBg(next);
  }

  const showPreview = status === "ok" || status === "fail" || status === "validating";

  return (
    <>
      <PageHead slug="qr-code-generator" />
      <QrToolTabs active="generator" />

      <div className="qr-gen-work">
        {/* 설정 패널 */}
        <div className="qr-panel">
          <div className="qr-panel-inner">
            {/* URL */}
            <div className="field-group">
              <label className="field-label" htmlFor="qr-url">
                {t("g.url")}
              </label>
              <input
                id="qr-url"
                className="qr-url-in"
                type="url"
                inputMode="url"
                maxLength={2048}
                placeholder={t("g.urlPh")}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* 인식 품질 */}
            <div className="field-group">
              <span className="field-label">{t("g.quality")}</span>
              <div className="type-seg" role="group" aria-label={t("g.quality")}>
                {LEVELS.map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    className={level === lv ? "is-active" : ""}
                    aria-pressed={level === lv}
                    onClick={() => setLevel(lv)}
                  >
                    {t("g.q." + lv)}
                  </button>
                ))}
              </div>
            </div>

            {/* PNG 해상도 */}
            <div className="field-group">
              <span className="field-label">{t("g.res")}</span>
              <div className="type-seg" role="group" aria-label={t("g.res")}>
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={resolution === r ? "is-active" : ""}
                    aria-pressed={resolution === r}
                    onClick={() => setResolution(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 데이터 셀 모양 */}
            <div className="field-group">
              <span className="field-label">{t("g.shape")}</span>
              <div className="qr-shapes" role="group" aria-label={t("g.shape")}>
                {SHAPE_ORDER.map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    className={"qr-shape" + (shape === sh ? " is-active" : "")}
                    aria-pressed={shape === sh}
                    onClick={() => setShape(sh)}
                  >
                    <ShapeIcon shape={sh} />
                    <span>{t("g.s." + sh)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 색상 */}
            <div className="qr-colors">
              <div className="field-group">
                <label className="field-label" htmlFor="qr-fg-hex">
                  {t("g.fg")}
                </label>
                <div className="qr-color-row">
                  <span className="swatch" style={{ background: fg }}>
                    <input
                      type="color"
                      aria-label={t("g.fg")}
                      value={isHex6(fg) ? fg : "#000000"}
                      onChange={(e) => {
                        setFg(e.target.value);
                        setFgText(e.target.value.toUpperCase());
                      }}
                    />
                  </span>
                  <input
                    id="qr-fg-hex"
                    className="hex-in"
                    type="text"
                    maxLength={7}
                    value={fgText.toUpperCase()}
                    onChange={(e) => onFgText(e.target.value)}
                  />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="qr-bg-hex">
                  {t("g.bg")}
                </label>
                <div className="qr-color-row">
                  <span className="swatch" style={{ background: bg }}>
                    <input
                      type="color"
                      aria-label={t("g.bg")}
                      value={isHex6(bg) ? bg : "#FFFFFF"}
                      onChange={(e) => {
                        setBg(e.target.value);
                        setBgText(e.target.value.toUpperCase());
                      }}
                    />
                  </span>
                  <input
                    id="qr-bg-hex"
                    className="hex-in"
                    type="text"
                    maxLength={7}
                    value={bgText.toUpperCase()}
                    onChange={(e) => onBgText(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {lowContrast && (
              <p className="qr-warn" role="status">
                {t("g.contrast")}
              </p>
            )}
          </div>
        </div>

        {/* 미리보기 + 검증 + 다운로드 */}
        <div className="qr-preview">
          <div className="qr-canvas-wrap">
            {showPreview ? (
              <canvas
                ref={previewRef}
                className="qr-canvas"
                role="img"
                aria-label={t("g.preview")}
              />
            ) : (
              <div className="qr-canvas-empty" aria-hidden>
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="6" width="14" height="14" rx="2" />
                  <rect x="28" y="6" width="14" height="14" rx="2" />
                  <rect x="6" y="28" width="14" height="14" rx="2" />
                  <path d="M28 28h6M40 28v6M28 40h6M40 34v8" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          <p
            className={"qr-status qr-status-" + status}
            role="status"
            aria-live="polite"
          >
            <span className="qr-status-dot" aria-hidden />
            <span>{t("g.st." + status)}</span>
          </p>

          <div className="qr-dl">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canDownload}
              onClick={downloadPng}
            >
              {t("g.png")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canDownload}
              onClick={downloadSvg}
            >
              {t("g.svg")}
            </button>
          </div>
        </div>
      </div>

      <Faq slug="qr-code-generator" />
      <RelatedTools slug="qr-code-generator" />
    </>
  );
}
