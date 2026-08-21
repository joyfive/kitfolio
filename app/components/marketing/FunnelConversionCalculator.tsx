"use client";

import { useState, useMemo } from "react";
import PageHead from "../PageHead";
import Faq from "../Faq";
import RelatedTools from "../RelatedTools";
import { useLang, useT, type Dict } from "../../lib/i18n";
import { analyzeFunnel, reverseCalculateFunnel } from "../../lib/marketing/funnel";
import type { FunnelStage, ReverseFunnelStage } from "../../lib/marketing/types";
import { fmtPct, fmtNumber } from "../../lib/marketing/format";

let _id = 0;
function uid() { return `s${++_id}`; }

const DICT: Dict = {
  ko: {
    "fn.modeAnalyze": "현재 퍼널 분석",
    "fn.modeReverse": "목표 역산",
    "fn.mode": "모드",
    "fn.addStage": "+ 단계 추가",
    "fn.removeStage": "단계 삭제",
    "fn.moveUp": "위로",
    "fn.moveDown": "아래로",
    "fn.stageName": "단계 이름",
    "fn.stageCount": "수량",
    "fn.stageConvRate": "다음 단계 전환율 (%)",
    "fn.finalTarget": "최종 목표 수량",
    "fn.preset": "퍼널 프리셋",
    "fn.presetAd": "광고 퍼널",
    "fn.presetLead": "리드 세일즈",
    "fn.presetCommerce": "커머스",
    "fn.presetConfirm": "현재 입력을 프리셋으로 덮어씁니다. 계속할까요?",
    "fn.reset": "초기화",
    "fn.overallRate": "전체 전환율",
    "fn.conversion": "전환율",
    "fn.dropOff": "이탈률",
    "fn.dropOffCount": "이탈 수",
    "fn.cumulative": "누적 전환율",
    "fn.required": "필요 수량",
    "fn.worstConv": "최저 전환율 구간",
    "fn.worstDrop": "최대 이탈률 구간",
    "fn.worstDropCount": "최대 이탈 수 구간",
    "fn.minStages": "최소 2단계가 필요합니다.",
    "fn.maxStages": "최대 10단계까지 추가할 수 있습니다.",
    "fn.warning": "이 단계의 수량이 이전 단계보다 큽니다. 재유입, 중복 이벤트 또는 측정 기준 차이로 발생할 수 있습니다.",
    "fn.noResult": "단계 수량을 입력하면 결과가 표시됩니다.",
    "fn.noResultReverse": "최종 목표 수량과 단계별 전환율을 입력하면 결과가 표시됩니다.",
    "fn.arrow": "→",
    "fn.copyPlan": "퍼널 계획 복사",
    "fn.copied": "복사됨",
  },
  en: {
    "fn.modeAnalyze": "Funnel analysis",
    "fn.modeReverse": "Reverse planning",
    "fn.mode": "Mode",
    "fn.addStage": "+ Add stage",
    "fn.removeStage": "Remove",
    "fn.moveUp": "Up",
    "fn.moveDown": "Down",
    "fn.stageName": "Stage name",
    "fn.stageCount": "Count",
    "fn.stageConvRate": "Conversion rate to next stage (%)",
    "fn.finalTarget": "Final target",
    "fn.preset": "Preset",
    "fn.presetAd": "Ad funnel",
    "fn.presetLead": "Lead sales",
    "fn.presetCommerce": "E-commerce",
    "fn.presetConfirm": "This will replace your current input with the preset. Continue?",
    "fn.reset": "Reset",
    "fn.overallRate": "Overall conversion rate",
    "fn.conversion": "Conv. rate",
    "fn.dropOff": "Drop-off rate",
    "fn.dropOffCount": "Drop-off count",
    "fn.cumulative": "Cumulative rate",
    "fn.required": "Required",
    "fn.worstConv": "Lowest conversion stage",
    "fn.worstDrop": "Highest drop-off rate stage",
    "fn.worstDropCount": "Highest drop-off count stage",
    "fn.minStages": "At least 2 stages are required.",
    "fn.maxStages": "Maximum 10 stages allowed.",
    "fn.warning": "This stage has more visitors than the previous stage. This can occur with retargeting, duplicate events, or different measurement standards.",
    "fn.noResult": "Enter stage counts to see results.",
    "fn.noResultReverse": "Enter a final target and stage conversion rates to see results.",
    "fn.arrow": "→",
    "fn.copyPlan": "Copy funnel plan",
    "fn.copied": "Copied",
  },
};

const PRESETS = {
  ko: {
    ad: [
      { name: "노출", count: "100000" },
      { name: "클릭", count: "5000" },
      { name: "랜딩", count: "3000" },
      { name: "전환", count: "150" },
    ],
    lead: [
      { name: "방문", count: "10000" },
      { name: "리드", count: "500" },
      { name: "MQL", count: "200" },
      { name: "SQL", count: "80" },
      { name: "계약", count: "20" },
    ],
    commerce: [
      { name: "방문", count: "50000" },
      { name: "상품 조회", count: "20000" },
      { name: "장바구니", count: "5000" },
      { name: "결제 시작", count: "2000" },
      { name: "구매", count: "800" },
    ],
  },
  en: {
    ad: [
      { name: "Impression", count: "100000" },
      { name: "Click", count: "5000" },
      { name: "Landing", count: "3000" },
      { name: "Conversion", count: "150" },
    ],
    lead: [
      { name: "Visit", count: "10000" },
      { name: "Lead", count: "500" },
      { name: "MQL", count: "200" },
      { name: "SQL", count: "80" },
      { name: "Deal", count: "20" },
    ],
    commerce: [
      { name: "Visit", count: "50000" },
      { name: "Product view", count: "20000" },
      { name: "Add to cart", count: "5000" },
      { name: "Checkout", count: "2000" },
      { name: "Purchase", count: "800" },
    ],
  },
};

function defaultAnalyzeStages(lang: "ko" | "en"): FunnelStage[] {
  const names = lang === "ko"
    ? ["노출", "클릭", "랜딩", "리드", "구매"]
    : ["Impression", "Click", "Landing", "Lead", "Purchase"];
  const counts = ["100000", "5000", "500", "50", ""];
  return names.map((name, i) => ({ id: uid(), name, count: counts[i] }));
}

function defaultReverseStages(lang: "ko" | "en"): ReverseFunnelStage[] {
  const names = lang === "ko"
    ? ["노출", "클릭", "리드", "구매"]
    : ["Impression", "Click", "Lead", "Purchase"];
  const rates = ["5", "10", "20", ""];
  return names.map((name, i) => ({ id: uid(), name, conversionRate: rates[i] }));
}

type AnalyzeMode = "analyze" | "reverse";

export default function FunnelConversionCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [mode, setMode] = useState<AnalyzeMode>("analyze");
  const [stages, setStages] = useState<FunnelStage[]>(() => defaultAnalyzeStages(lang));
  const [reverseStages, setReverseStages] = useState<ReverseFunnelStage[]>(() => defaultReverseStages(lang));
  const [finalTarget, setFinalTarget] = useState("100");
  const [copied, setCopied] = useState(false);

  function applyPreset(preset: { name: string; count: string }[]) {
    if (stages.some((s) => s.count) && !window.confirm(t("fn.presetConfirm"))) return;
    setStages(preset.map((p) => ({ id: uid(), name: p.name, count: p.count })));
  }

  function addStage() {
    if (stages.length >= 10) return;
    setStages((prev) => [...prev, { id: uid(), name: "", count: "" }]);
  }

  function removeStage(id: string) {
    if (stages.length <= 2) return;
    setStages((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStage(id: string, dir: "up" | "down") {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function updateStage(id: string, field: "name" | "count", value: string) {
    setStages((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function addReverseStage() {
    if (reverseStages.length >= 10) return;
    setReverseStages((prev) => {
      const idx = prev.length - 1;
      return [...prev.slice(0, idx), { id: uid(), name: "", conversionRate: "" }, prev[idx]];
    });
  }

  function removeReverseStage(id: string) {
    if (reverseStages.length <= 2) return;
    setReverseStages((prev) => prev.filter((s) => s.id !== id));
  }

  function updateReverseStage(id: string, field: "name" | "conversionRate", value: string) {
    setReverseStages((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function reset() {
    setStages(defaultAnalyzeStages(lang));
    setReverseStages(defaultReverseStages(lang));
    setFinalTarget("100");
  }

  const analyzeResult = useMemo(() => analyzeFunnel(stages), [stages]);

  const reverseResult = useMemo(() => {
    const target = parseInt(finalTarget, 10);
    if (!target || target <= 0) return null;
    return reverseCalculateFunnel(target, reverseStages);
  }, [finalTarget, reverseStages]);

  const hasAnalyzeResult = analyzeResult.stages.some((s) => s.count > 0);

  function copyPlan() {
    let text = "";
    if (mode === "analyze" && hasAnalyzeResult) {
      text = analyzeResult.stages
        .map((s, i) => {
          const conv = s.conversionRate !== null ? ` (${t("fn.conversion")}: ${fmtPct(s.conversionRate, 1)})` : "";
          return `${i + 1}. ${s.name}: ${fmtNumber(s.count, 0)}${conv}`;
        })
        .join("\n");
      if (analyzeResult.overallRate !== null) {
        text += `\n${t("fn.overallRate")}: ${fmtPct(analyzeResult.overallRate, 2)}`;
      }
    } else if (mode === "reverse" && reverseResult) {
      text = reverseResult.stages
        .map((s, i) => `${i + 1}. ${s.name}: ${fmtNumber(s.required, 0)}`)
        .join("\n");
      if (reverseResult.overallRate !== null) {
        text += `\n${t("fn.overallRate")}: ${fmtPct(reverseResult.overallRate, 2)}`;
      }
    }
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const presets = PRESETS[lang];

  return (
    <>
      <PageHead slug="funnel-conversion-calculator" />

      <div className="fn-work">
        {/* Input */}
        <div className="fn-inputs">
          <div className="fn-inputs-head">
            <span className="lbl">{t("fn.mode")}</span>
            <div className="seg">
              <button className={mode === "analyze" ? "is-active" : ""} onClick={() => setMode("analyze")}>
                {t("fn.modeAnalyze")}
              </button>
              <button className={mode === "reverse" ? "is-active" : ""} onClick={() => setMode("reverse")}>
                {t("fn.modeReverse")}
              </button>
            </div>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("fn.reset")}</span>
            </button>
          </div>

          {/* Presets */}
          {mode === "analyze" && (
            <div className="fn-presets">
              <span className="fn-preset-lbl">{t("fn.preset")}</span>
              <button className="badge" onClick={() => applyPreset(presets.ad)}>{t("fn.presetAd")}</button>
              <button className="badge" onClick={() => applyPreset(presets.lead)}>{t("fn.presetLead")}</button>
              <button className="badge" onClick={() => applyPreset(presets.commerce)}>{t("fn.presetCommerce")}</button>
            </div>
          )}

          <div className="fn-form">
            {mode === "analyze" ? (
              <>
                <div className="fn-stage-header">
                  <span className="fn-col-name">{t("fn.stageName")}</span>
                  <span className="fn-col-count">{t("fn.stageCount")}</span>
                  <span className="fn-col-acts" />
                </div>
                {stages.map((stage, i) => (
                  <div key={stage.id} className="fn-stage-row">
                    <input
                      className="fn-stage-name"
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                      aria-label={`${t("fn.stageName")} ${i + 1}`}
                    />
                    <input
                      className="fn-stage-count"
                      type="text"
                      inputMode="numeric"
                      value={stage.count}
                      onChange={(e) => updateStage(stage.id, "count", e.target.value)}
                      aria-label={`${t("fn.stageCount")} ${i + 1}`}
                    />
                    <div className="fn-stage-acts">
                      <button
                        className="fn-act-btn"
                        onClick={() => moveStage(stage.id, "up")}
                        disabled={i === 0}
                        aria-label={t("fn.moveUp")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 12V4M4 8l4-4 4 4" /></svg>
                      </button>
                      <button
                        className="fn-act-btn"
                        onClick={() => moveStage(stage.id, "down")}
                        disabled={i === stages.length - 1}
                        aria-label={t("fn.moveDown")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 4v8M4 8l4 4 4-4" /></svg>
                      </button>
                      <button
                        className="fn-act-btn danger"
                        onClick={() => removeStage(stage.id)}
                        disabled={stages.length <= 2}
                        aria-label={t("fn.removeStage")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V2.5h4V4M5.5 4l.5 9.5h4l.5-9.5" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {stages.length < 10 && (
                  <button className="fn-add-btn" onClick={addStage}>{t("fn.addStage")}</button>
                )}
              </>
            ) : (
              <>
                <div className="fn-field-row">
                  <label className="fn-field-lbl" htmlFor="fn-final-target">{t("fn.finalTarget")}</label>
                  <input
                    id="fn-final-target"
                    className="fn-final-input"
                    type="text"
                    inputMode="numeric"
                    value={finalTarget}
                    onChange={(e) => setFinalTarget(e.target.value)}
                  />
                </div>
                <div className="fn-stage-header reverse">
                  <span className="fn-col-name">{t("fn.stageName")}</span>
                  <span className="fn-col-rate">{t("fn.stageConvRate")}</span>
                  <span className="fn-col-acts" />
                </div>
                {reverseStages.map((stage, i) => (
                  <div key={stage.id} className="fn-stage-row">
                    <input
                      className="fn-stage-name"
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateReverseStage(stage.id, "name", e.target.value)}
                      aria-label={`${t("fn.stageName")} ${i + 1}`}
                    />
                    {i < reverseStages.length - 1 ? (
                      <input
                        className="fn-stage-count"
                        type="text"
                        inputMode="decimal"
                        value={stage.conversionRate}
                        onChange={(e) => updateReverseStage(stage.id, "conversionRate", e.target.value)}
                        aria-label={`${t("fn.stageConvRate")} ${i + 1}`}
                      />
                    ) : (
                      <span className="fn-stage-count fn-final-badge">{t("fn.finalTarget")}</span>
                    )}
                    <div className="fn-stage-acts">
                      <button
                        className="fn-act-btn danger"
                        onClick={() => removeReverseStage(stage.id)}
                        disabled={reverseStages.length <= 2}
                        aria-label={t("fn.removeStage")}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V2.5h4V4M5.5 4l.5 9.5h4l.5-9.5" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {reverseStages.length < 10 && (
                  <button className="fn-add-btn" onClick={addReverseStage}>{t("fn.addStage")}</button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="fn-results">
          {mode === "analyze" ? (
            hasAnalyzeResult ? (
              <>
                {analyzeResult.overallRate !== null && (
                  <div className="fn-overall">
                    <span className="fn-overall-lbl">{t("fn.overallRate")}</span>
                    <span className="fn-overall-val num">{fmtPct(analyzeResult.overallRate, 2)}</span>
                  </div>
                )}

                <div className="fn-funnel-viz">
                  {analyzeResult.stages.map((stage, i) => {
                    const widthPct = analyzeResult.stages[0].count > 0
                      ? Math.max(8, (stage.count / analyzeResult.stages[0].count) * 100)
                      : 100;
                    return (
                      <div key={stage.id} className="fn-viz-stage">
                        <div className="fn-viz-bar-wrap">
                          <div
                            className={`fn-viz-bar${stage.warning ? " warn" : ""}`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <div className="fn-viz-info">
                          <span className="fn-viz-name">{stage.name || `Stage ${i + 1}`}</span>
                          <span className="fn-viz-count num">{fmtNumber(stage.count, 0)}</span>
                          {stage.conversionRate !== null && (
                            <span className={`fn-viz-rate${i === analyzeResult.worstConversionIdx ? " worst" : ""}`}>
                              {t("fn.arrow")} {fmtPct(stage.conversionRate, 1)}
                            </span>
                          )}
                        </div>
                        {stage.warning && (
                          <div className="fn-stage-warn" role="alert">{t("fn.warning")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="fn-detail-table">
                  <div className="fn-detail-head">
                    <span>{t("fn.stageName")}</span>
                    <span>{t("fn.conversion")}</span>
                    <span>{t("fn.dropOff")}</span>
                    <span>{t("fn.cumulative")}</span>
                  </div>
                  {analyzeResult.stages.map((stage, i) => (
                    <div key={stage.id} className="fn-detail-row">
                      <span className="fn-detail-name">{stage.name || `Stage ${i + 1}`}</span>
                      <span className={`fn-detail-val num${i === analyzeResult.worstConversionIdx ? " worst" : ""}`}>
                        {stage.conversionRate !== null ? fmtPct(stage.conversionRate, 1) : "-"}
                      </span>
                      <span className={`fn-detail-val num${i === analyzeResult.worstDropOffRateIdx ? " worst" : ""}`}>
                        {stage.dropOffRate !== null ? fmtPct(stage.dropOffRate, 1) : "-"}
                      </span>
                      <span className="fn-detail-val num">{fmtPct(stage.cumulativeRate, 1)}</span>
                    </div>
                  ))}
                </div>

                <button className="adm-copy-btn" onClick={copyPlan}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
                    <path d="M3.5 10.5H2.5a1 1 0 01-1-1v-8a1 1 0 011-1h8a1 1 0 011 1v1" />
                  </svg>
                  {copied ? t("fn.copied") : t("fn.copyPlan")}
                </button>

                <div className="privacy">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                    <path d="M6 8l1.5 1.5L10.5 6.5" />
                  </svg>
                  <span>{t("common.privacy")}</span>
                </div>
              </>
            ) : (
              <div className="fn-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 17l6-6 4 4 8-10" />
                </svg>
                <span>{t("fn.noResult")}</span>
              </div>
            )
          ) : (
            reverseResult && reverseResult.stages.length > 0 ? (
              <>
                {reverseResult.overallRate !== null && (
                  <div className="fn-overall">
                    <span className="fn-overall-lbl">{t("fn.overallRate")}</span>
                    <span className="fn-overall-val num">{fmtPct(reverseResult.overallRate, 2)}</span>
                  </div>
                )}

                <div className="fn-reverse-list" aria-live="polite">
                  {reverseResult.stages.map((stage, i) => (
                    <div key={stage.id} className="fn-reverse-stage">
                      <div className="frs-name">{stage.name || `Stage ${i + 1}`}</div>
                      <div className="frs-required num">{fmtNumber(stage.required, 0)}</div>
                      <div className="frs-label">{t("fn.required")}</div>
                      {i < reverseResult.stages.length - 1 && stage.conversionRate !== null && (
                        <div className="frs-rate">
                          {t("fn.arrow")} {fmtPct(stage.conversionRate, 1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="adm-copy-btn" onClick={copyPlan}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
                    <path d="M3.5 10.5H2.5a1 1 0 01-1-1v-8a1 1 0 011-1h8a1 1 0 011 1v1" />
                  </svg>
                  {copied ? t("fn.copied") : t("fn.copyPlan")}
                </button>

                <div className="privacy">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                    <path d="M6 8l1.5 1.5L10.5 6.5" />
                  </svg>
                  <span>{t("common.privacy")}</span>
                </div>
              </>
            ) : (
              <div className="fn-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 17l6-6 4 4 8-10" />
                </svg>
                <span>{t("fn.noResultReverse")}</span>
              </div>
            )
          )}
        </div>
      </div>

      <Faq slug="funnel-conversion-calculator" />
      <RelatedTools slug="funnel-conversion-calculator" />
    </>
  );
}
