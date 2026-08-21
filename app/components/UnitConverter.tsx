"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import ToolGuide from "./ToolGuide";
import { useLang, useT, type Dict } from "../lib/i18n";
import { localizedHref } from "../lib/content";

export type ConverterMode = "rem-px" | "em-px" | "vw-px" | "percent-px" | "ms-s";

const MODE_SLUG: Record<ConverterMode, string> = {
  "rem-px": "rem-to-px",
  "em-px": "em-to-px",
  "vw-px": "vw-to-px",
  "percent-px": "percent-to-px",
  "ms-s": "ms-to-s",
};

const TABS: { mode: ConverterMode; labelKo: string; labelEn: string }[] = [
  { mode: "rem-px",     labelKo: "rem ↔ px",  labelEn: "rem ↔ px" },
  { mode: "em-px",      labelKo: "em ↔ px",   labelEn: "em ↔ px" },
  { mode: "vw-px",      labelKo: "vw ↔ px",   labelEn: "vw ↔ px" },
  { mode: "percent-px", labelKo: "% ↔ px",    labelEn: "% ↔ px" },
  { mode: "ms-s",       labelKo: "ms ↔ s",    labelEn: "ms ↔ s" },
];

interface Config {
  unitA: string;
  unitB: string;
  labelA: { ko: string; en: string };
  labelB: { ko: string; en: string };
  extraLabel?: { ko: string; en: string };
  extraDefault?: number;
  extraMin?: number;
  hasViewportPresets?: boolean;
  defaultInput: number;
  examples: number[];
}

const CONFIGS: Record<ConverterMode, Config> = {
  "rem-px": {
    unitA: "rem",
    unitB: "px",
    labelA: { ko: "rem 값", en: "rem value" },
    labelB: { ko: "px 값", en: "px value" },
    extraLabel: { ko: "루트 폰트 크기 (px)", en: "Root font size (px)" },
    extraDefault: 16,
    extraMin: 1,
    defaultInput: 1,
    examples: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2],
  },
  "em-px": {
    unitA: "em",
    unitB: "px",
    labelA: { ko: "em 값", en: "em value" },
    labelB: { ko: "px 값", en: "px value" },
    extraLabel: { ko: "부모 폰트 크기 (px)", en: "Parent font size (px)" },
    extraDefault: 16,
    extraMin: 1,
    defaultInput: 1,
    examples: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5],
  },
  "vw-px": {
    unitA: "vw",
    unitB: "px",
    labelA: { ko: "vw 값", en: "vw value" },
    labelB: { ko: "px 값", en: "px value" },
    extraLabel: { ko: "뷰포트 너비 (px)", en: "Viewport width (px)" },
    extraDefault: 1440,
    extraMin: 1,
    hasViewportPresets: true,
    defaultInput: 100,
    examples: [25, 33.33, 50, 66.67, 75, 100],
  },
  "percent-px": {
    unitA: "%",
    unitB: "px",
    labelA: { ko: "퍼센트 값", en: "Percent value" },
    labelB: { ko: "px 값", en: "px value" },
    extraLabel: { ko: "부모 너비 (px)", en: "Parent width (px)" },
    extraDefault: 1440,
    extraMin: 1,
    defaultInput: 100,
    examples: [25, 33.33, 50, 66.67, 75, 100],
  },
  "ms-s": {
    unitA: "ms",
    unitB: "s",
    labelA: { ko: "밀리초 (ms)", en: "Milliseconds (ms)" },
    labelB: { ko: "초 (s)", en: "Seconds (s)" },
    defaultInput: 300,
    examples: [100, 200, 300, 500, 1000, 1500, 2000],
  },
};

const VIEWPORT_PRESETS = [390, 768, 1024, 1440, 1920];

const DICT: Dict = {
  ko: {
    "uc.from": "입력",
    "uc.to": "결과",
    "uc.swap": "방향 전환",
    "uc.reset": "초기화",
    "uc.copy": "복사",
    "uc.copied": "복사됨",
    "uc.settings": "설정",
    "uc.examples": "빠른 예시",
    "uc.tab.label": "CSS 단위 변환기",
  },
  en: {
    "uc.from": "Input",
    "uc.to": "Result",
    "uc.swap": "Swap",
    "uc.reset": "Reset",
    "uc.copy": "Copy",
    "uc.copied": "Copied",
    "uc.settings": "Settings",
    "uc.examples": "Quick examples",
    "uc.tab.label": "CSS Unit Converters",
  },
};

function fmt(n: number): string {
  return parseFloat(n.toFixed(4)).toString();
}

function calcForward(mode: ConverterMode, a: number, extra: number): number {
  switch (mode) {
    case "rem-px":     return a * extra;
    case "em-px":      return a * extra;
    case "vw-px":      return (a * extra) / 100;
    case "percent-px": return (a * extra) / 100;
    case "ms-s":       return a / 1000;
  }
}

function calcBackward(mode: ConverterMode, b: number, extra: number): number {
  switch (mode) {
    case "rem-px":     return extra !== 0 ? b / extra : 0;
    case "em-px":      return extra !== 0 ? b / extra : 0;
    case "vw-px":      return extra !== 0 ? (b / extra) * 100 : 0;
    case "percent-px": return extra !== 0 ? (b / extra) * 100 : 0;
    case "ms-s":       return b * 1000;
  }
}

export default function UnitConverter({ mode }: { mode: ConverterMode }) {
  const { lang } = useLang();
  const t = useT(DICT);
  const cfg = CONFIGS[mode];
  const slug = MODE_SLUG[mode];

  const [rawInput, setRawInput] = useState(String(cfg.defaultInput));
  const [isSwapped, setIsSwapped] = useState(false);
  const [extra, setExtra] = useState(cfg.extraDefault ?? 0);
  const [copied, setCopied] = useState(false);

  const inputNum = parseFloat(rawInput);
  const validInput = isFinite(inputNum) && !isNaN(inputNum);

  const outputValue = useMemo(() => {
    if (!validInput) return "";
    const result = isSwapped
      ? calcBackward(mode, inputNum, extra)
      : calcForward(mode, inputNum, extra);
    if (!isFinite(result)) return "";
    return fmt(result);
  }, [mode, rawInput, isSwapped, extra, validInput, inputNum]);

  const fromUnit = isSwapped ? cfg.unitB : cfg.unitA;
  const toUnit   = isSwapped ? cfg.unitA : cfg.unitB;
  const fromLabel = isSwapped
    ? (lang === "ko" ? cfg.labelB.ko : cfg.labelB.en)
    : (lang === "ko" ? cfg.labelA.ko : cfg.labelA.en);

  function handleSwap() {
    if (outputValue !== "") {
      setRawInput(outputValue);
    }
    setIsSwapped((s) => !s);
  }

  function handleReset() {
    setRawInput(String(cfg.defaultInput));
    setIsSwapped(false);
    setExtra(cfg.extraDefault ?? 0);
    setCopied(false);
  }

  async function handleCopy() {
    if (!outputValue) return;
    try { await navigator.clipboard.writeText(outputValue); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function fillExample(val: number) {
    if (isSwapped) setIsSwapped(false);
    setRawInput(String(val));
  }

  const examples = useMemo(() => {
    return cfg.examples.map((v) => {
      const result = calcForward(mode, v, extra);
      return { input: v, output: isFinite(result) ? fmt(result) : "-" };
    });
  }, [mode, cfg.examples, extra]);

  return (
    <>
      {/* Tab navigation: above PageHead */}
      <div className="uc-tabs">
        <div className="uc-tabs-inner">
          <span className="uc-tabs-label">{t("uc.tab.label")}</span>
          {TABS.map((tab) => (
            <Link
              key={tab.mode}
              href={localizedHref(lang, "/" + MODE_SLUG[tab.mode])}
              className={`uc-tab${tab.mode === mode ? " is-active" : ""}`}
              prefetch={true}
            >
              {lang === "ko" ? tab.labelKo : tab.labelEn}
            </Link>
          ))}
        </div>
      </div>

      <PageHead slug={slug} />

      <div className="uc-work">
        <div className="uc-card">
          {/* Converter */}
          <div className="uc-converter">
            {/* Input row */}
            <div className="uc-field">
              <label className="uc-label">{fromLabel}</label>
              <div className="uc-input-row">
                <input
                  className="uc-input"
                  type="number"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="0"
                />
                <span className="uc-input-unit">{fromUnit}</span>
              </div>
            </div>

            {/* Swap button */}
            <div className="uc-swap-row">
              <button className="uc-swap-btn" onClick={handleSwap} aria-label={t("uc.swap")} title={t("uc.swap")}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 8l-3 3 3 3M15 12l3-3-3-3M2 11h16M2 9h16" />
                </svg>
                <span>{t("uc.swap")}</span>
              </button>
            </div>

            {/* Output row */}
            <div className="uc-field">
              <label className="uc-label">{t("uc.to")}</label>
              <div className="uc-output-row">
                <span className="uc-output-value">
                  {outputValue !== "" ? outputValue : "-"}
                </span>
                <span className="uc-input-unit">{toUnit}</span>
                <button
                  className={`uc-copy-btn${copied ? " copied" : ""}`}
                  onClick={handleCopy}
                  disabled={!outputValue}
                >
                  {copied ? (
                    <>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 8l3.5 3.5L13 5" />
                      </svg>
                      {t("uc.copied")}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="4" width="8.5" height="10" rx="1.5" />
                        <path d="M3.5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v.5" />
                      </svg>
                      {t("uc.copy")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="uc-divider" />

          {/* Settings */}
          {cfg.extraLabel && (
            <div className="uc-settings">
              <div className="uc-settings-label">
                {lang === "ko" ? cfg.extraLabel.ko : cfg.extraLabel.en}
              </div>
              <div className="uc-extra-row">
                <input
                  className="uc-extra-input"
                  type="number"
                  min={cfg.extraMin ?? 1}
                  value={extra}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (isFinite(v) && v > 0) setExtra(v);
                  }}
                />
                {cfg.hasViewportPresets && (
                  <div className="uc-presets">
                    {VIEWPORT_PRESETS.map((p) => (
                      <button
                        key={p}
                        className={`uc-preset${extra === p ? " is-active" : ""}`}
                        onClick={() => setExtra(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="uc-actions">
            <button className="btn btn-sm btn-outline" onClick={handleReset}>
              {t("uc.reset")}
            </button>
            <div className="privacy">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
        </div>

        {/* Quick examples */}
        <div className="uc-examples">
          <div className="uc-examples-label">{t("uc.examples")}</div>
          <div className="uc-chips">
            {examples.map(({ input, output }) => (
              <button
                key={input}
                className="uc-chip"
                onClick={() => fillExample(input)}
              >
                <span className="uc-chip-from">{input} {cfg.unitA}</span>
                <span className="uc-chip-arrow">→</span>
                <span className="uc-chip-to">{output} {cfg.unitB}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ToolGuide slug={slug} />
      <Faq slug={slug} />
      <RelatedTools slug={slug} />
    </>
  );
}
