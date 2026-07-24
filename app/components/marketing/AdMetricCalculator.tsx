"use client";

import { useState, useMemo } from "react";
import PageHead from "../PageHead";
import Faq from "../Faq";
import RelatedTools from "../RelatedTools";
import ToolGuide from "../ToolGuide";
import AdMetricTabs from "./AdMetricTabs";
import { useLang, useT, type Dict } from "../../lib/i18n";
import type { Currency } from "../../lib/marketing/types";
import { fmtCurrency, fmtNumber, fmtPct, fmtMultiple, parseNum } from "../../lib/marketing/format";
import {
  calcRoas, calcTargetRevenue, calcAllowableBudget, calcBreakEvenRoas,
  calcCpa, calcExpectedConversions, calcRequiredBudgetCpa,
  calcCpc, calcExpectedClicks, calcRequiredBudgetCpc,
  calcCpm, calcExpectedImpressions, calcRequiredBudgetCpm,
  calcCtr, calcRequiredClicks, calcRequiredImpressions,
} from "../../lib/marketing/adMetrics";
import type { AdMetricKey } from "../../lib/marketing/types";

const DICT: Dict = {
  ko: {
    "m.mode": "계산 모드",
    "m.currency": "통화",
    "m.reset": "초기화",
    "m.copy": "복사",
    "m.copied": "복사됨",
    "m.enterValues": "값을 입력하면 결과가 표시됩니다.",
    "m.result": "계산 결과",
    "m.formula": "계산 공식",
    "m.warning.clicksOverImpressions": "클릭 수가 노출 수보다 많습니다. 측정 기준을 확인하세요.",

    // ROAS
    "roas.modeA": "ROAS 계산",
    "roas.modeB": "목표 매출 계산",
    "roas.modeC": "허용 광고비 계산",
    "roas.spend": "광고비",
    "roas.revenue": "광고 매출",
    "roas.targetRoas": "목표 ROAS (%)",
    "roas.targetRevenue": "목표 매출",
    "roas.margin": "매출총이익률 (%)",
    "roas.marginOpt": "선택 입력 — 손익분기 ROAS 계산용",
    "roas.result.roas": "ROAS",
    "roas.result.multiple": "ROAS 배수",
    "roas.result.diff": "광고비 대비 매출 차액",
    "roas.result.targetRevenue": "목표 매출",
    "roas.result.allowBudget": "허용 광고비",
    "roas.result.breakeven": "손익분기 ROAS",
    "roas.formula.a": "ROAS(%) = 광고 매출 ÷ 광고비 × 100",
    "roas.formula.b": "목표 매출 = 광고비 × (목표 ROAS ÷ 100)",
    "roas.formula.c": "허용 광고비 = 목표 매출 ÷ (목표 ROAS ÷ 100)",
    "roas.formula.be": "손익분기 ROAS = 100 ÷ 매출총이익률",

    // CPA
    "cpa.modeA": "CPA 계산",
    "cpa.modeB": "예상 전환 수",
    "cpa.modeC": "필요 예산",
    "cpa.spend": "광고비",
    "cpa.conversions": "전환 수",
    "cpa.budget": "광고 예산",
    "cpa.targetCpa": "목표 CPA",
    "cpa.targetConversions": "목표 전환 수",
    "cpa.result.cpa": "CPA (전환당 비용)",
    "cpa.result.conversions": "예상 전환 수",
    "cpa.result.budget": "필요 예산",
    "cpa.formula.a": "CPA = 광고비 ÷ 전환 수",
    "cpa.formula.b": "예상 전환 수 = floor(예산 ÷ 목표 CPA)",
    "cpa.formula.c": "필요 예산 = 목표 전환 수 × 목표 CPA",
    "cpa.unit.conversions": "건",

    // CPC
    "cpc.modeA": "CPC 계산",
    "cpc.modeB": "예상 클릭 수",
    "cpc.modeC": "필요 예산",
    "cpc.spend": "광고비",
    "cpc.clicks": "클릭 수",
    "cpc.budget": "광고 예산",
    "cpc.targetCpc": "목표 CPC",
    "cpc.targetClicks": "목표 클릭 수",
    "cpc.result.cpc": "CPC (클릭당 비용)",
    "cpc.result.clicks": "예상 클릭 수",
    "cpc.result.budget": "필요 예산",
    "cpc.formula.a": "CPC = 광고비 ÷ 클릭 수",
    "cpc.formula.b": "예상 클릭 수 = floor(예산 ÷ 목표 CPC)",
    "cpc.formula.c": "필요 예산 = 목표 클릭 수 × 목표 CPC",
    "cpc.unit.clicks": "회",

    // CPM
    "cpm.modeA": "CPM 계산",
    "cpm.modeB": "예상 노출 수",
    "cpm.modeC": "필요 예산",
    "cpm.spend": "광고비",
    "cpm.impressions": "노출 수",
    "cpm.budget": "광고 예산",
    "cpm.targetCpm": "목표 CPM",
    "cpm.targetImpressions": "목표 노출 수",
    "cpm.result.cpm": "CPM (천 회 노출당 비용)",
    "cpm.result.impressions": "예상 노출 수",
    "cpm.result.budget": "필요 예산",
    "cpm.formula.a": "CPM = 광고비 ÷ 노출 수 × 1,000",
    "cpm.formula.b": "예상 노출 수 = floor(예산 ÷ 목표 CPM × 1,000)",
    "cpm.formula.c": "필요 예산 = 목표 노출 수 ÷ 1,000 × 목표 CPM",
    "cpm.unit.impressions": "회",

    // CTR
    "ctr.modeA": "CTR 계산",
    "ctr.modeB": "필요 클릭 수",
    "ctr.modeC": "필요 노출 수",
    "ctr.clicks": "클릭 수",
    "ctr.impressions": "노출 수",
    "ctr.targetCtr": "목표 CTR (%)",
    "ctr.result.ctr": "CTR (클릭률)",
    "ctr.result.clicks": "필요 클릭 수",
    "ctr.result.impressions": "필요 노출 수",
    "ctr.formula.a": "CTR(%) = 클릭 수 ÷ 노출 수 × 100",
    "ctr.formula.b": "필요 클릭 수 = ceil(노출 수 × 목표 CTR ÷ 100)",
    "ctr.formula.c": "필요 노출 수 = ceil(클릭 수 ÷ (목표 CTR ÷ 100))",
    "ctr.unit.clicks": "회",
    "ctr.unit.impressions": "회",
  },
  en: {
    "m.mode": "Calculation mode",
    "m.currency": "Currency",
    "m.reset": "Reset",
    "m.copy": "Copy",
    "m.copied": "Copied",
    "m.enterValues": "Enter values above to see results.",
    "m.result": "Result",
    "m.formula": "Formula",
    "m.warning.clicksOverImpressions": "Clicks exceed impressions. Check your measurement settings.",

    // ROAS
    "roas.modeA": "Calculate ROAS",
    "roas.modeB": "Calculate target revenue",
    "roas.modeC": "Calculate allowable budget",
    "roas.spend": "Ad spend",
    "roas.revenue": "Ad revenue",
    "roas.targetRoas": "Target ROAS (%)",
    "roas.targetRevenue": "Target revenue",
    "roas.margin": "Gross margin (%)",
    "roas.marginOpt": "Optional — for break-even ROAS",
    "roas.result.roas": "ROAS",
    "roas.result.multiple": "ROAS multiple",
    "roas.result.diff": "Revenue minus spend",
    "roas.result.targetRevenue": "Target revenue",
    "roas.result.allowBudget": "Allowable ad budget",
    "roas.result.breakeven": "Break-even ROAS",
    "roas.formula.a": "ROAS (%) = ad revenue ÷ ad spend × 100",
    "roas.formula.b": "Target revenue = ad spend × (target ROAS ÷ 100)",
    "roas.formula.c": "Allowable budget = target revenue ÷ (target ROAS ÷ 100)",
    "roas.formula.be": "Break-even ROAS = 100 ÷ gross margin (%)",

    // CPA
    "cpa.modeA": "Calculate CPA",
    "cpa.modeB": "Expected conversions",
    "cpa.modeC": "Required budget",
    "cpa.spend": "Ad spend",
    "cpa.conversions": "Conversions",
    "cpa.budget": "Ad budget",
    "cpa.targetCpa": "Target CPA",
    "cpa.targetConversions": "Target conversions",
    "cpa.result.cpa": "CPA (cost per acquisition)",
    "cpa.result.conversions": "Expected conversions",
    "cpa.result.budget": "Required budget",
    "cpa.formula.a": "CPA = ad spend ÷ conversions",
    "cpa.formula.b": "Expected conversions = floor(budget ÷ target CPA)",
    "cpa.formula.c": "Required budget = target conversions × target CPA",
    "cpa.unit.conversions": "",

    // CPC
    "cpc.modeA": "Calculate CPC",
    "cpc.modeB": "Expected clicks",
    "cpc.modeC": "Required budget",
    "cpc.spend": "Ad spend",
    "cpc.clicks": "Clicks",
    "cpc.budget": "Ad budget",
    "cpc.targetCpc": "Target CPC",
    "cpc.targetClicks": "Target clicks",
    "cpc.result.cpc": "CPC (cost per click)",
    "cpc.result.clicks": "Expected clicks",
    "cpc.result.budget": "Required budget",
    "cpc.formula.a": "CPC = ad spend ÷ clicks",
    "cpc.formula.b": "Expected clicks = floor(budget ÷ target CPC)",
    "cpc.formula.c": "Required budget = target clicks × target CPC",
    "cpc.unit.clicks": "",

    // CPM
    "cpm.modeA": "Calculate CPM",
    "cpm.modeB": "Expected impressions",
    "cpm.modeC": "Required budget",
    "cpm.spend": "Ad spend",
    "cpm.impressions": "Impressions",
    "cpm.budget": "Ad budget",
    "cpm.targetCpm": "Target CPM",
    "cpm.targetImpressions": "Target impressions",
    "cpm.result.cpm": "CPM (cost per 1,000 impressions)",
    "cpm.result.impressions": "Expected impressions",
    "cpm.result.budget": "Required budget",
    "cpm.formula.a": "CPM = ad spend ÷ impressions × 1,000",
    "cpm.formula.b": "Expected impressions = floor(budget ÷ target CPM × 1,000)",
    "cpm.formula.c": "Required budget = target impressions ÷ 1,000 × target CPM",
    "cpm.unit.impressions": "",

    // CTR
    "ctr.modeA": "Calculate CTR",
    "ctr.modeB": "Required clicks",
    "ctr.modeC": "Required impressions",
    "ctr.clicks": "Clicks",
    "ctr.impressions": "Impressions",
    "ctr.targetCtr": "Target CTR (%)",
    "ctr.result.ctr": "CTR (click-through rate)",
    "ctr.result.clicks": "Required clicks",
    "ctr.result.impressions": "Required impressions",
    "ctr.formula.a": "CTR (%) = clicks ÷ impressions × 100",
    "ctr.formula.b": "Required clicks = ceil(impressions × target CTR ÷ 100)",
    "ctr.formula.c": "Required impressions = ceil(clicks ÷ (target CTR ÷ 100))",
    "ctr.unit.clicks": "",
    "ctr.unit.impressions": "",
  },
};

const CURRENCIES: Currency[] = ["KRW", "USD", "JPY", "EUR"];

type Mode = "A" | "B" | "C";

interface Props {
  metricKey: AdMetricKey;
}

const DEFAULTS: Record<AdMetricKey, Record<string, string>> = {
  roas: { spend: "1000000", revenue: "4000000", targetRoas: "400", targetRevenue: "4000000", margin: "" },
  cpa: { spend: "1000000", conversions: "200", budget: "1000000", targetCpa: "5000", targetConversions: "100" },
  cpc: { spend: "300000", clicks: "1500", budget: "300000", targetCpc: "200", targetClicks: "1000" },
  cpm: { spend: "500000", impressions: "2000000", budget: "500000", targetCpm: "250", targetImpressions: "2000000" },
  ctr: { clicks: "2500", impressions: "100000", targetCtr: "2.5", targetClicks: "2500" },
};

export default function AdMetricCalculator({ metricKey }: Props) {
  const { lang } = useLang();
  const t = useT(DICT);

  const [mode, setMode] = useState<Mode>("A");
  const [currency, setCurrency] = useState<Currency>(lang === "ko" ? "KRW" : "USD");
  const [vals, setVals] = useState<Record<string, string>>(DEFAULTS[metricKey]);
  const [copied, setCopied] = useState(false);

  const slugMap: Record<AdMetricKey, string> = {
    roas: "roas-calculator",
    cpa: "cpa-calculator",
    cpc: "cpc-calculator",
    cpm: "cpm-calculator",
    ctr: "ctr-calculator",
  };
  const slug = slugMap[metricKey];

  function set(key: string, value: string) {
    setVals((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setMode("A");
    setVals(DEFAULTS[metricKey]);
  }

  const v = useMemo(() => {
    const n: Record<string, number> = {};
    for (const [k, s] of Object.entries(vals)) {
      n[k] = parseNum(s);
    }
    return n;
  }, [vals]);

  // ── Results ──
  const result = useMemo(() => {
    if (metricKey === "roas") {
      const beRoas = v.margin > 0 ? calcBreakEvenRoas(v.margin) : null;
      if (mode === "A") {
        const r = calcRoas(v.spend, v.revenue);
        return r ? { ...r, beRoas } : { beRoas };
      }
      if (mode === "B") {
        const rev = calcTargetRevenue(v.spend, v.targetRoas);
        return { targetRevenue: rev, beRoas };
      }
      if (mode === "C") {
        const budget = calcAllowableBudget(v.targetRevenue, v.targetRoas);
        return { allowBudget: budget, beRoas };
      }
    }
    if (metricKey === "cpa") {
      if (mode === "A") return { cpa: calcCpa(v.spend, v.conversions) };
      if (mode === "B") return { conversions: calcExpectedConversions(v.budget, v.targetCpa) };
      if (mode === "C") return { budget: calcRequiredBudgetCpa(v.targetConversions, v.targetCpa) };
    }
    if (metricKey === "cpc") {
      if (mode === "A") return { cpc: calcCpc(v.spend, v.clicks) };
      if (mode === "B") return { clicks: calcExpectedClicks(v.budget, v.targetCpc) };
      if (mode === "C") return { budget: calcRequiredBudgetCpc(v.targetClicks, v.targetCpc) };
    }
    if (metricKey === "cpm") {
      if (mode === "A") return { cpm: calcCpm(v.spend, v.impressions) };
      if (mode === "B") return { impressions: calcExpectedImpressions(v.budget, v.targetCpm) };
      if (mode === "C") return { budget: calcRequiredBudgetCpm(v.targetImpressions, v.targetCpm) };
    }
    if (metricKey === "ctr") {
      const warning = v.clicks > v.impressions && v.impressions > 0;
      if (mode === "A") return { ctr: calcCtr(v.clicks, v.impressions), warning };
      if (mode === "B") return { clicks: calcRequiredClicks(v.impressions, v.targetCtr), warning: false };
      if (mode === "C") return { impressions: calcRequiredImpressions(v.clicks, v.targetCtr), warning: false };
    }
    return {};
  }, [metricKey, mode, v]);

  // ── Copy result summary ──
  function copyResult() {
    const lines: string[] = [];
    for (const [k, val] of Object.entries(result ?? {})) {
      if (val === null || val === undefined || val === false) continue;
      if (k === "warning") continue;
      if (typeof val === "number") {
        lines.push(`${k}: ${val}`);
      }
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const p = metricKey;

  const modeLabels = [
    t(`${p}.modeA`),
    t(`${p}.modeB`),
    t(`${p}.modeC`),
  ];

  const hasCurrency = metricKey !== "ctr";

  return (
    <>
      <PageHead slug={slug} />

      <div className="adm-work">
        <AdMetricTabs />

        {/* Controls bar */}
        <div className="adm-controls">
          <div className="adm-controls-left">
            <span className="adm-ctrl-lbl">{t("m.mode")}</span>
            <div className="seg">
              {(["A", "B", "C"] as Mode[]).map((m, i) => (
                <button
                  key={m}
                  className={mode === m ? "is-active" : ""}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                >
                  {modeLabels[i]}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-controls-right">
            {hasCurrency && (
              <>
                <span className="adm-ctrl-lbl">{t("m.currency")}</span>
                <div className="seg">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      className={currency === c ? "is-active" : ""}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("m.reset")}</span>
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="adm-grid">
          {/* Input panel */}
          <div className="adm-input-card">
            {metricKey === "roas" && <RoasInputs mode={mode} vals={vals} set={set} t={t} currency={currency} />}
            {metricKey === "cpa" && <CpaInputs mode={mode} vals={vals} set={set} t={t} currency={currency} />}
            {metricKey === "cpc" && <CpcInputs mode={mode} vals={vals} set={set} t={t} currency={currency} />}
            {metricKey === "cpm" && <CpmInputs mode={mode} vals={vals} set={set} t={t} currency={currency} />}
            {metricKey === "ctr" && <CtrInputs mode={mode} vals={vals} set={set} t={t} />}
          </div>

          {/* Result panel */}
          <div className="adm-result-col">
            {result && Object.keys(result).some((k) => k !== "warning" && k !== "beRoas" && result[k as keyof typeof result] !== null && result[k as keyof typeof result] !== undefined) ? (
              <>
                {(result as { warning?: boolean }).warning && (
                  <div className="adm-warning" role="alert">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2L1.5 13.5h13L8 2z" /><path d="M8 6v4M8 11.5v.5" />
                    </svg>
                    <span>{t("m.warning.clicksOverImpressions")}</span>
                  </div>
                )}
                <div className="adm-result-cards" aria-live="polite">
                  {metricKey === "roas" && <RoasResults mode={mode} result={result as Record<string, number | null>} t={t} currency={currency} />}
                  {metricKey === "cpa" && <SimpleResult result={result as Record<string, number | null>} t={t} currency={currency} metricKey="cpa" mode={mode} />}
                  {metricKey === "cpc" && <SimpleResult result={result as Record<string, number | null>} t={t} currency={currency} metricKey="cpc" mode={mode} />}
                  {metricKey === "cpm" && <SimpleResult result={result as Record<string, number | null>} t={t} currency={currency} metricKey="cpm" mode={mode} />}
                  {metricKey === "ctr" && <CtrResults mode={mode} result={result as Record<string, number | null | boolean>} t={t} />}
                </div>

                <div className="adm-formula">
                  <span className="adm-formula-label">{t("m.formula")}</span>
                  <code>{t(`${p}.formula.${mode.toLowerCase()}`)}</code>
                  {metricKey === "roas" && (result as Record<string, number | null>).beRoas !== null && (
                    <code>{t("roas.formula.be")}</code>
                  )}
                </div>

                <button className="adm-copy-btn" onClick={copyResult}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
                    <path d="M3.5 10.5H2.5a1 1 0 01-1-1v-8a1 1 0 011-1h8a1 1 0 011 1v1" />
                  </svg>
                  {copied ? t("m.copied") : t("m.copy")}
                </button>
              </>
            ) : (
              <div className="adm-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
                <span>{t("m.enterValues")}</span>
              </div>
            )}

            <div className="privacy">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
        </div>
      </div>

      <ToolGuide slug={slug} />
      <Faq slug={slug} />
      <RelatedTools slug={slug} />
    </>
  );
}

// ── Input components ──

function NumField({
  id, label, value, onChange, suffix, hint, inputMode = "decimal",
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  suffix?: string; hint?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="adm-field">
      <label htmlFor={id} className="adm-field-lbl">{label}</label>
      <div className="adm-field-input">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {suffix && <span className="adm-field-suffix">{suffix}</span>}
      </div>
      {hint && <span className="adm-field-hint">{hint}</span>}
    </div>
  );
}

function CurrencySymbol({ currency }: { currency: Currency }) {
  const map: Record<Currency, string> = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" };
  return <>{map[currency]}</>;
}

function RoasInputs({ mode, vals, set, t, currency }: {
  mode: Mode; vals: Record<string, string>;
  set: (k: string, v: string) => void; t: (k: string) => string; currency: Currency;
}) {
  const sym = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" }[currency];
  return (
    <div className="adm-fields">
      {mode === "A" && (
        <>
          <NumField id="roas-spend" label={t("roas.spend")} value={vals.spend} onChange={(v) => set("spend", v)} suffix={sym} inputMode="numeric" />
          <NumField id="roas-revenue" label={t("roas.revenue")} value={vals.revenue} onChange={(v) => set("revenue", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
      {mode === "B" && (
        <>
          <NumField id="roas-spend" label={t("roas.spend")} value={vals.spend} onChange={(v) => set("spend", v)} suffix={sym} inputMode="numeric" />
          <NumField id="roas-targetRoas" label={t("roas.targetRoas")} value={vals.targetRoas} onChange={(v) => set("targetRoas", v)} suffix="%" />
        </>
      )}
      {mode === "C" && (
        <>
          <NumField id="roas-targetRevenue" label={t("roas.targetRevenue")} value={vals.targetRevenue} onChange={(v) => set("targetRevenue", v)} suffix={sym} inputMode="numeric" />
          <NumField id="roas-targetRoas" label={t("roas.targetRoas")} value={vals.targetRoas} onChange={(v) => set("targetRoas", v)} suffix="%" />
        </>
      )}
      <NumField id="roas-margin" label={t("roas.margin")} value={vals.margin} onChange={(v) => set("margin", v)} suffix="%" hint={t("roas.marginOpt")} />
    </div>
  );
}

function CpaInputs({ mode, vals, set, t, currency }: {
  mode: Mode; vals: Record<string, string>;
  set: (k: string, v: string) => void; t: (k: string) => string; currency: Currency;
}) {
  const sym = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" }[currency];
  return (
    <div className="adm-fields">
      {mode === "A" && (
        <>
          <NumField id="cpa-spend" label={t("cpa.spend")} value={vals.spend} onChange={(v) => set("spend", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpa-conversions" label={t("cpa.conversions")} value={vals.conversions} onChange={(v) => set("conversions", v)} inputMode="numeric" />
        </>
      )}
      {mode === "B" && (
        <>
          <NumField id="cpa-budget" label={t("cpa.budget")} value={vals.budget} onChange={(v) => set("budget", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpa-targetCpa" label={t("cpa.targetCpa")} value={vals.targetCpa} onChange={(v) => set("targetCpa", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
      {mode === "C" && (
        <>
          <NumField id="cpa-targetConversions" label={t("cpa.targetConversions")} value={vals.targetConversions} onChange={(v) => set("targetConversions", v)} inputMode="numeric" />
          <NumField id="cpa-targetCpa" label={t("cpa.targetCpa")} value={vals.targetCpa} onChange={(v) => set("targetCpa", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
    </div>
  );
}

function CpcInputs({ mode, vals, set, t, currency }: {
  mode: Mode; vals: Record<string, string>;
  set: (k: string, v: string) => void; t: (k: string) => string; currency: Currency;
}) {
  const sym = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" }[currency];
  return (
    <div className="adm-fields">
      {mode === "A" && (
        <>
          <NumField id="cpc-spend" label={t("cpc.spend")} value={vals.spend} onChange={(v) => set("spend", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpc-clicks" label={t("cpc.clicks")} value={vals.clicks} onChange={(v) => set("clicks", v)} inputMode="numeric" />
        </>
      )}
      {mode === "B" && (
        <>
          <NumField id="cpc-budget" label={t("cpc.budget")} value={vals.budget} onChange={(v) => set("budget", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpc-targetCpc" label={t("cpc.targetCpc")} value={vals.targetCpc} onChange={(v) => set("targetCpc", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
      {mode === "C" && (
        <>
          <NumField id="cpc-targetClicks" label={t("cpc.targetClicks")} value={vals.targetClicks} onChange={(v) => set("targetClicks", v)} inputMode="numeric" />
          <NumField id="cpc-targetCpc" label={t("cpc.targetCpc")} value={vals.targetCpc} onChange={(v) => set("targetCpc", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
    </div>
  );
}

function CpmInputs({ mode, vals, set, t, currency }: {
  mode: Mode; vals: Record<string, string>;
  set: (k: string, v: string) => void; t: (k: string) => string; currency: Currency;
}) {
  const sym = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" }[currency];
  return (
    <div className="adm-fields">
      {mode === "A" && (
        <>
          <NumField id="cpm-spend" label={t("cpm.spend")} value={vals.spend} onChange={(v) => set("spend", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpm-impressions" label={t("cpm.impressions")} value={vals.impressions} onChange={(v) => set("impressions", v)} inputMode="numeric" />
        </>
      )}
      {mode === "B" && (
        <>
          <NumField id="cpm-budget" label={t("cpm.budget")} value={vals.budget} onChange={(v) => set("budget", v)} suffix={sym} inputMode="numeric" />
          <NumField id="cpm-targetCpm" label={t("cpm.targetCpm")} value={vals.targetCpm} onChange={(v) => set("targetCpm", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
      {mode === "C" && (
        <>
          <NumField id="cpm-targetImpressions" label={t("cpm.targetImpressions")} value={vals.targetImpressions} onChange={(v) => set("targetImpressions", v)} inputMode="numeric" />
          <NumField id="cpm-targetCpm" label={t("cpm.targetCpm")} value={vals.targetCpm} onChange={(v) => set("targetCpm", v)} suffix={sym} inputMode="numeric" />
        </>
      )}
    </div>
  );
}

function CtrInputs({ mode, vals, set, t }: {
  mode: Mode; vals: Record<string, string>;
  set: (k: string, v: string) => void; t: (k: string) => string;
}) {
  return (
    <div className="adm-fields">
      {mode === "A" && (
        <>
          <NumField id="ctr-clicks" label={t("ctr.clicks")} value={vals.clicks} onChange={(v) => set("clicks", v)} inputMode="numeric" />
          <NumField id="ctr-impressions" label={t("ctr.impressions")} value={vals.impressions} onChange={(v) => set("impressions", v)} inputMode="numeric" />
        </>
      )}
      {mode === "B" && (
        <>
          <NumField id="ctr-impressions" label={t("ctr.impressions")} value={vals.impressions} onChange={(v) => set("impressions", v)} inputMode="numeric" />
          <NumField id="ctr-targetCtr" label={t("ctr.targetCtr")} value={vals.targetCtr} onChange={(v) => set("targetCtr", v)} suffix="%" />
        </>
      )}
      {mode === "C" && (
        <>
          <NumField id="ctr-clicks" label={t("ctr.clicks")} value={vals.clicks} onChange={(v) => set("clicks", v)} inputMode="numeric" />
          <NumField id="ctr-targetCtr" label={t("ctr.targetCtr")} value={vals.targetCtr} onChange={(v) => set("targetCtr", v)} suffix="%" />
        </>
      )}
    </div>
  );
}

// ── Result components ──

function ResultCard({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={`adm-result-card${primary ? " primary" : ""}`}>
      <div className="arc-label">{label}</div>
      <div className="arc-value num">{value}</div>
    </div>
  );
}

function RoasResults({ mode, result, t, currency }: {
  mode: Mode; result: Record<string, number | null>; t: (k: string) => string; currency: Currency;
}) {
  return (
    <>
      {mode === "A" && (
        <>
          {result.pct !== null && result.pct !== undefined && (
            <ResultCard label={t("roas.result.roas")} value={fmtPct(result.pct as number, 2)} primary />
          )}
          {result.multiple !== null && result.multiple !== undefined && (
            <ResultCard label={t("roas.result.multiple")} value={fmtMultiple(result.multiple as number)} />
          )}
          {result.diff !== null && result.diff !== undefined && (
            <ResultCard label={t("roas.result.diff")} value={fmtCurrency(result.diff as number, currency)} />
          )}
        </>
      )}
      {mode === "B" && result.targetRevenue !== null && result.targetRevenue !== undefined && (
        <ResultCard label={t("roas.result.targetRevenue")} value={fmtCurrency(result.targetRevenue as number, currency)} primary />
      )}
      {mode === "C" && result.allowBudget !== null && result.allowBudget !== undefined && (
        <ResultCard label={t("roas.result.allowBudget")} value={fmtCurrency(result.allowBudget as number, currency)} primary />
      )}
      {result.beRoas !== null && result.beRoas !== undefined && (
        <ResultCard label={t("roas.result.breakeven")} value={fmtPct(result.beRoas as number, 2)} />
      )}
    </>
  );
}

function SimpleResult({ result, t, currency, metricKey, mode }: {
  result: Record<string, number | null>; t: (k: string) => string;
  currency: Currency; metricKey: AdMetricKey; mode: Mode;
}) {
  const p = metricKey;
  if (mode === "A") {
    const val = result[p];
    if (val === null || val === undefined) return null;
    return <ResultCard label={t(`${p}.result.${p}`)} value={fmtCurrency(val as number, currency)} primary />;
  }
  if (mode === "B") {
    const val = result[p === "cpa" ? "conversions" : p === "cpc" ? "clicks" : "impressions"];
    if (val === null || val === undefined) return null;
    const unit = t(`${p}.unit.${p === "cpa" ? "conversions" : p === "cpc" ? "clicks" : "impressions"}`);
    const label = t(`${p}.result.${p === "cpa" ? "conversions" : p === "cpc" ? "clicks" : "impressions"}`);
    return <ResultCard label={label} value={`${fmtNumber(val as number, 0)}${unit}`} primary />;
  }
  if (mode === "C") {
    const val = result.budget;
    if (val === null || val === undefined) return null;
    return <ResultCard label={t(`${p}.result.budget`)} value={fmtCurrency(val as number, currency)} primary />;
  }
  return null;
}

function CtrResults({ mode, result, t }: {
  mode: Mode; result: Record<string, number | null | boolean>; t: (k: string) => string;
}) {
  if (mode === "A") {
    const val = result.ctr;
    if (val === null || val === undefined) return null;
    return <ResultCard label={t("ctr.result.ctr")} value={fmtPct(val as number, 2)} primary />;
  }
  if (mode === "B") {
    const val = result.clicks;
    if (val === null || val === undefined) return null;
    return <ResultCard label={t("ctr.result.clicks")} value={fmtNumber(val as number, 0)} primary />;
  }
  if (mode === "C") {
    const val = result.impressions;
    if (val === null || val === undefined) return null;
    return <ResultCard label={t("ctr.result.impressions")} value={fmtNumber(val as number, 0)} primary />;
  }
  return null;
}
