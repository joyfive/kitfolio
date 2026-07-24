"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageHead from "../PageHead";
import Faq from "../Faq";
import RelatedTools from "../RelatedTools";
import ToolGuide from "../ToolGuide";
import { useLang, useT, type Dict } from "../../lib/i18n";
import { localizedHref } from "../../lib/content";
import { compute } from "./growthMath";
import type { GrowthMode, Direction } from "./growthMath";
import { CONFIGS } from "./calculatorConfig";
import type { OutputFormat } from "./calculatorConfig";

// ── Number formatting ─────────────────────────────────────

function fmtNum(n: number): string {
  const fixed = parseFloat(n.toFixed(4));
  return fixed.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function fmtPct(n: number, signed = true): string {
  const fixed = parseFloat(n.toFixed(4));
  const abs = Math.abs(fixed).toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (!signed) return abs + "%";
  if (fixed > 0) return "+" + abs + "%";
  if (fixed < 0) return "−" + abs + "%";
  return "0%";
}

function fmtMultiplier(n: number): string {
  return parseFloat(n.toFixed(4)).toLocaleString("en-US", { maximumFractionDigits: 4 }) + "×";
}

function fmtNumSigned(n: number): string {
  const fixed = parseFloat(n.toFixed(4));
  const abs = Math.abs(fixed).toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (fixed > 0) return "+" + abs;
  if (fixed < 0) return "−" + abs;
  return "0";
}

function formatValue(value: number, format: OutputFormat): string {
  switch (format) {
    case "pct-signed":  return fmtPct(value, true);
    case "pct":         return fmtPct(value, false);
    case "num":         return fmtNum(value);
    case "num-signed":  return fmtNumSigned(value);
    case "multiplier":  return fmtMultiplier(value);
    case "progress":    return fmtPct(value, false);
    case "direction":   return ""; // handled separately
  }
}

// ── Localised strings ─────────────────────────────────────

const DICT: Dict = {
  ko: {
    "gc.tab.label":  "성장 계산기",
    "gc.reset":      "초기화",
    "gc.copy":       "복사",
    "gc.copied":     "복사됨",
    "gc.examples":   "빠른 예시",
    "gc.formula":    "계산식",
    "gc.increase":   "증가",
    "gc.decrease":   "감소",
    "gc.no-change":  "변화 없음",
    "gc.empty":      "값을 입력하면 결과가 표시됩니다.",
  },
  en: {
    "gc.tab.label":  "Growth Calculators",
    "gc.reset":      "Reset",
    "gc.copy":       "Copy",
    "gc.copied":     "Copied",
    "gc.examples":   "Quick examples",
    "gc.formula":    "Formula",
    "gc.increase":   "Increase",
    "gc.decrease":   "Decrease",
    "gc.no-change":  "No change",
    "gc.empty":      "Enter values above to see results.",
  },
};

function directionLabel(d: Direction, t: (k: string) => string): string {
  if (d === "increase") return t("gc.increase");
  if (d === "decrease") return t("gc.decrease");
  return t("gc.no-change");
}

// ── Component ─────────────────────────────────────────────

export default function GrowthCalculator({ mode }: { mode: GrowthMode }) {
  const { lang } = useLang();
  const t = useT(DICT);
  const cfg = CONFIGS[mode];

  const initInputs = Object.fromEntries(cfg.inputs.map((inp) => [inp.key, ""]));
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(initInputs);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function setField(key: string, val: string) {
    setRawInputs((prev) => ({ ...prev, [key]: val }));
  }

  function handleReset() {
    setRawInputs(initInputs);
    setCopiedKey(null);
  }

  const numericInputs = useMemo(() => {
    const result: Record<string, number> = {};
    for (const inp of cfg.inputs) {
      const raw = rawInputs[inp.key].replace(/,/g, "");
      result[inp.key] = parseFloat(raw);
    }
    return result;
  }, [rawInputs, cfg.inputs]);

  const allFilled = cfg.inputs.every((inp) => rawInputs[inp.key].trim() !== "");

  const error = useMemo(() => {
    if (!allFilled) return null;
    if (cfg.errorWhen) return cfg.errorWhen(numericInputs);
    return null;
  }, [allFilled, numericInputs, cfg]);

  const result = useMemo(() => {
    if (!allFilled || error) return null;
    return compute(mode, numericInputs);
  }, [mode, numericInputs, allFilled, error]);

  async function handleCopy(key: string, displayValue: string) {
    try { await navigator.clipboard.writeText(displayValue); } catch { /* ignore */ }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const formula = lang === "ko" ? cfg.formulaKo : cfg.formulaEn;

  return (
    <>
      {/* Tab navigation */}
      <div className="uc-tabs">
        <div className="uc-tabs-inner">
          <span className="uc-tabs-label">{t("gc.tab.label")}</span>
          {cfg.tabs.map((tab) => (
            <Link
              key={tab.mode}
              href={localizedHref(lang, "/" + tab.slug)}
              className={`uc-tab${tab.mode === mode ? " is-active" : ""}`}
              prefetch={true}
            >
              {lang === "ko" ? tab.label.ko : tab.label.en}
            </Link>
          ))}
        </div>
      </div>

      <PageHead slug={cfg.slug} />

      <div className="gc-work">
        {/* Input card */}
        <div className="gc-card">
          <div className="gc-inputs">
            {cfg.inputs.map((inp) => (
              <div key={inp.key} className="gc-field">
                <label className="gc-label" htmlFor={`gc-${inp.key}`}>
                  {lang === "ko" ? inp.label.ko : inp.label.en}
                </label>
                <div className="gc-input-row">
                  <input
                    id={`gc-${inp.key}`}
                    className="gc-input"
                    type="number"
                    inputMode="decimal"
                    value={rawInputs[inp.key]}
                    onChange={(e) => setField(inp.key, e.target.value)}
                    placeholder="0"
                  />
                  {inp.unit && <span className="gc-input-unit">{inp.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="uc-divider" />

          <div className="uc-actions">
            <button className="btn btn-sm btn-outline" onClick={handleReset}>
              {t("gc.reset")}
            </button>
            <div className="privacy" style={{ marginLeft: "auto" }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
        </div>

        {/* Right column: results + formula + examples */}
        <div className="gc-right">
          {/* Results */}
          <div className="gc-results-card">
            {!allFilled && (
              <p className="gc-empty">{t("gc.empty")}</p>
            )}
            {allFilled && error && (
              <p className="gc-error">{lang === "ko" ? error.ko : error.en}</p>
            )}
            {result && (
              <div className="gc-result-grid">
                {cfg.outputs.map((out) => {
                  const raw = result[out.key];
                  if (raw === undefined || raw === null) return null;

                  let displayValue: string;
                  if (out.format === "direction") {
                    displayValue = directionLabel(raw as Direction, t);
                  } else {
                    displayValue = formatValue(raw as number, out.format);
                  }

                  const isIncrease = out.format === "direction" && (raw as Direction) === "increase";
                  const isDecrease = out.format === "direction" && (raw as Direction) === "decrease";
                  const isPrimary = out.primary;

                  return (
                    <div key={out.key} className={`gc-result-item${isPrimary ? " is-primary" : ""}`}>
                      <span className="gc-result-label">
                        {lang === "ko" ? out.label.ko : out.label.en}
                      </span>
                      <div className="gc-result-row">
                        <span
                          className={`gc-result-value${
                            out.format === "direction"
                              ? isIncrease
                                ? " dir-up"
                                : isDecrease
                                ? " dir-down"
                                : " dir-flat"
                              : out.format === "pct-signed" || out.format === "num-signed"
                              ? (raw as number) > 0
                                ? " is-positive"
                                : (raw as number) < 0
                                ? " is-negative"
                                : ""
                              : ""
                          }`}
                        >
                          {displayValue}
                        </span>
                        {out.format !== "direction" && (
                          <button
                            className={`uc-copy-btn${copiedKey === out.key ? " copied" : ""}`}
                            onClick={() => handleCopy(out.key, displayValue)}
                          >
                            {copiedKey === out.key ? (
                              <>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <path d="M3 8l3.5 3.5L13 5" />
                                </svg>
                                {t("gc.copied")}
                              </>
                            ) : (
                              <>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="4" y="4" width="8.5" height="10" rx="1.5" />
                                  <path d="M3.5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v.5" />
                                </svg>
                                {t("gc.copy")}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formula */}
          <div className="gc-formula">
            <span className="gc-formula-label">{t("gc.formula")}</span>
            <code className="gc-formula-code">{formula}</code>
          </div>

          {/* Quick examples */}
          <div className="uc-examples">
            <div className="uc-examples-label">{t("gc.examples")}</div>
            <div className="uc-chips">
              {cfg.examples.map((ex, i) => (
                <button
                  key={i}
                  className="uc-chip"
                  onClick={() => {
                    const next: Record<string, string> = {};
                    for (const inp of cfg.inputs) {
                      next[inp.key] = String(ex.inputs[inp.key] ?? "");
                    }
                    setRawInputs(next);
                  }}
                >
                  <span className="uc-chip-from">{lang === "ko" ? ex.label.ko : ex.label.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToolGuide slug={cfg.slug} />
      <Faq slug={cfg.slug} />
      <RelatedTools slug={cfg.slug} />
    </>
  );
}
