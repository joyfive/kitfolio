"use client";

import { useState, useMemo, useEffect } from "react";
import PageHead from "../PageHead";
import Faq from "../Faq";
import RelatedTools from "../RelatedTools";
import { useLang, useT, type Dict } from "../../lib/i18n";
import { calcBudgetPacing } from "../../lib/marketing/budgetPacing";
import type { Currency, PacingStatus } from "../../lib/marketing/types";
import { fmtCurrency, fmtPct, fmtNumber, parseNum } from "../../lib/marketing/format";

const DICT: Dict = {
  ko: {
    "bp.inputHead": "캠페인 정보",
    "bp.reset": "초기화",
    "bp.totalBudget": "총 광고 예산",
    "bp.startDate": "캠페인 시작일",
    "bp.endDate": "캠페인 종료일",
    "bp.refDate": "기준일",
    "bp.spent": "기준일까지 사용한 광고비",
    "bp.runMode": "집행 기준",
    "bp.runDaily": "매일",
    "bp.runWeekday": "평일만",
    "bp.expectedDaily": "예상 일평균 광고비",
    "bp.expectedDailyHint": "미입력 시 현재 실제 일평균 광고비 사용",
    "bp.currency": "통화",
    "bp.status": "페이싱 상태",
    "bp.over": "과다 집행",
    "bp.on": "정상 집행",
    "bp.under": "집행 부족",
    "bp.statusMsg.over": "현재 계획보다 {gap}%p 빠르게 예산을 사용하고 있습니다.",
    "bp.statusMsg.on": "기간 진행률과 예산 소진율의 차이가 {gap}%p입니다.",
    "bp.statusMsg.under": "현재 계획보다 {gap}%p 느리게 예산을 사용하고 있습니다.",
    "bp.timePct": "기간 진행률",
    "bp.burnPct": "예산 소진율",
    "bp.pacingGap": "페이싱 차이",
    "bp.planned": "기준일 계획 지출액",
    "bp.actual": "실제 누적 지출액",
    "bp.variance": "계획 대비 차액",
    "bp.remaining": "남은 예산",
    "bp.remainDays": "남은 집행일",
    "bp.totalDays": "전체 집행일",
    "bp.elapsedDays": "경과 집행일",
    "bp.reqDaily": "남은 기간 필요 일평균 광고비",
    "bp.currDaily": "현재 일평균 광고비",
    "bp.projected": "예상 최종 지출액",
    "bp.projectedBurn": "예상 최종 소진율",
    "bp.timebar": "기간 진행",
    "bp.burnbar": "예산 소진",
    "bp.noResult": "캠페인 정보를 입력하면 결과가 표시됩니다.",
    "bp.noReqDaily": "남은 집행일 없음",
    "bp.noCurrDaily": "집행 이력 없음",
    "bp.days": "일",
    "bp.errorEndBeforeStart": "종료일은 시작일 이후여야 합니다.",
    "bp.errorBudgetZero": "총예산을 입력하세요.",
  },
  en: {
    "bp.inputHead": "Campaign details",
    "bp.reset": "Reset",
    "bp.totalBudget": "Total budget",
    "bp.startDate": "Campaign start date",
    "bp.endDate": "Campaign end date",
    "bp.refDate": "Reference date",
    "bp.spent": "Spend to date",
    "bp.runMode": "Running days",
    "bp.runDaily": "Every day",
    "bp.runWeekday": "Weekdays only",
    "bp.expectedDaily": "Expected daily spend",
    "bp.expectedDailyHint": "Leave blank to use current actual daily average",
    "bp.currency": "Currency",
    "bp.status": "Pacing status",
    "bp.over": "Overpacing",
    "bp.on": "On track",
    "bp.under": "Underpacing",
    "bp.statusMsg.over": "Spending {gap}%pt faster than planned.",
    "bp.statusMsg.on": "Time progress and budget burn rate differ by {gap}%pt.",
    "bp.statusMsg.under": "Spending {gap}%pt slower than planned.",
    "bp.timePct": "Time progress",
    "bp.burnPct": "Budget burn rate",
    "bp.pacingGap": "Pacing gap",
    "bp.planned": "Planned spend at reference date",
    "bp.actual": "Actual spend to date",
    "bp.variance": "Variance vs. plan",
    "bp.remaining": "Remaining budget",
    "bp.remainDays": "Remaining days",
    "bp.totalDays": "Total days",
    "bp.elapsedDays": "Elapsed days",
    "bp.reqDaily": "Required daily spend (remaining period)",
    "bp.currDaily": "Current daily average spend",
    "bp.projected": "Projected final spend",
    "bp.projectedBurn": "Projected final burn rate",
    "bp.timebar": "Time elapsed",
    "bp.burnbar": "Budget burned",
    "bp.noResult": "Enter campaign details to see results.",
    "bp.noReqDaily": "No remaining days",
    "bp.noCurrDaily": "No spend recorded yet",
    "bp.days": "d",
    "bp.errorEndBeforeStart": "End date must be after start date.",
    "bp.errorBudgetZero": "Enter a total budget.",
  },
};

const CURRENCIES: Currency[] = ["KRW", "USD", "JPY", "EUR"];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AdBudgetPacingCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [totalBudget, setTotalBudget] = useState("10000000");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refDate, setRefDate] = useState("");
  const [spent, setSpent] = useState("6000000");
  const [runMode, setRunMode] = useState<"daily" | "weekday">("daily");
  const [expectedDaily, setExpectedDaily] = useState("");
  const [currency, setCurrency] = useState<Currency>(lang === "ko" ? "KRW" : "USD");

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 14);
    const end = new Date(today);
    end.setDate(today.getDate() + 15);

    setStartDate(toDateStr(start));
    setEndDate(toDateStr(end));
    setRefDate(toDateStr(today));
  }, []);

  function reset() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 14);
    const end = new Date(today);
    end.setDate(today.getDate() + 15);
    setTotalBudget("10000000");
    setStartDate(toDateStr(start));
    setEndDate(toDateStr(end));
    setRefDate(toDateStr(today));
    setSpent("6000000");
    setRunMode("daily");
    setExpectedDaily("");
  }

  const validationError = useMemo(() => {
    if (!totalBudget || parseNum(totalBudget) <= 0) return t("bp.errorBudgetZero");
    if (startDate && endDate && startDate > endDate) return t("bp.errorEndBeforeStart");
    return null;
  }, [totalBudget, startDate, endDate, t]);

  const result = useMemo(() => {
    if (validationError || !startDate || !endDate || !refDate) return null;
    const budget = parseNum(totalBudget);
    if (budget <= 0) return null;
    const expD = expectedDaily.trim() !== "" ? parseNum(expectedDaily) : undefined;
    return calcBudgetPacing({
      totalBudget: budget,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      referenceDate: new Date(refDate),
      spentToDate: parseNum(spent),
      runMode,
      expectedDailySpend: expD,
    });
  }, [validationError, startDate, endDate, refDate, totalBudget, spent, runMode, expectedDaily]);

  function statusClass(s: PacingStatus) {
    return s === "over" ? "over" : s === "under" ? "under" : "on";
  }

  function statusMsg(status: PacingStatus, gap: number): string {
    const absGap = Math.abs(gap).toFixed(1);
    return t(`bp.statusMsg.${statusClass(status)}`).replace("{gap}", absGap);
  }

  function barPct(v: number) {
    return Math.min(100, Math.max(0, v));
  }

  return (
    <>
      <PageHead slug="ad-budget-pacing-calculator" />

      <div className="bp-work">
        {/* Input */}
        <div className="bp-inputs">
          <div className="bp-inputs-head">
            <span className="lbl">{t("bp.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("bp.reset")}</span>
            </button>
          </div>

          <div className="bp-form">
            <div className="bp-row bp-row-2">
              <BpField label={t("bp.totalBudget")}>
                <input type="text" inputMode="numeric" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} />
              </BpField>
              <div className="bp-field">
                <span className="bp-field-lbl">{t("bp.currency")}</span>
                <div className="seg bp-seg-sm">
                  {CURRENCIES.map((c) => (
                    <button key={c} className={currency === c ? "is-active" : ""} onClick={() => setCurrency(c)}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bp-row bp-row-2">
              <BpField label={t("bp.startDate")}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </BpField>
              <BpField label={t("bp.endDate")}>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </BpField>
            </div>

            <div className="bp-row bp-row-2">
              <BpField label={t("bp.refDate")}>
                <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} />
              </BpField>
              <BpField label={t("bp.spent")}>
                <input type="text" inputMode="numeric" value={spent} onChange={(e) => setSpent(e.target.value)} />
              </BpField>
            </div>

            <div className="bp-row-mode">
              <span className="bp-field-lbl">{t("bp.runMode")}</span>
              <div className="seg">
                <button className={runMode === "daily" ? "is-active" : ""} onClick={() => setRunMode("daily")}>{t("bp.runDaily")}</button>
                <button className={runMode === "weekday" ? "is-active" : ""} onClick={() => setRunMode("weekday")}>{t("bp.runWeekday")}</button>
              </div>
            </div>

            <BpField label={t("bp.expectedDaily")} hint={t("bp.expectedDailyHint")}>
              <input type="text" inputMode="numeric" value={expectedDaily} onChange={(e) => setExpectedDaily(e.target.value)} placeholder="—" />
            </BpField>

            {validationError && (
              <div className="bp-error" role="alert">{validationError}</div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bp-results">
          {result ? (
            <>
              {/* Status card */}
              <div className={`bp-status-card ${statusClass(result.status)}`}>
                <div className="bsc-badge">{t(`bp.${statusClass(result.status)}`)}</div>
                <div className="bsc-msg">{statusMsg(result.status, result.pacingGap)}</div>
                <div className="bsc-gap num">{result.pacingGap >= 0 ? "+" : ""}{result.pacingGap.toFixed(1)}%p</div>
              </div>

              {/* Progress bars */}
              <div className="bp-bars">
                <ProgressBar label={t("bp.timebar")} pct={result.timePct} value={fmtPct(result.timePct, 1)} color="var(--color-blue-gray-600)" />
                <ProgressBar label={t("bp.burnbar")} pct={result.burnPct} value={fmtPct(result.burnPct, 1)} color={result.status === "over" ? "#c0504e" : result.status === "under" ? "#f59e0b" : "var(--color-blue-primary-600)"} />
              </div>

              {/* Metric grid */}
              <div className="bp-metric-grid">
                <BpMetric label={t("bp.timePct")} value={fmtPct(result.timePct, 1)} />
                <BpMetric label={t("bp.burnPct")} value={fmtPct(result.burnPct, 1)} />
                <BpMetric label={t("bp.planned")} value={fmtCurrency(result.plannedSpend, currency)} />
                <BpMetric label={t("bp.actual")} value={fmtCurrency(parseNum(spent), currency)} />
                <BpMetric
                  label={t("bp.variance")}
                  value={`${result.variance >= 0 ? "+" : ""}${fmtCurrency(result.variance, currency)}`}
                  accent={result.variance > 0 ? "over" : result.variance < 0 ? "under" : ""}
                />
                <BpMetric label={t("bp.remaining")} value={fmtCurrency(result.remainingBudget, currency)} />
              </div>

              {/* Days + daily */}
              <div className="bp-days-grid">
                <BpMetric label={t("bp.totalDays")} value={`${result.totalDays}${t("bp.days")}`} />
                <BpMetric label={t("bp.elapsedDays")} value={`${result.elapsedDays}${t("bp.days")}`} />
                <BpMetric label={t("bp.remainDays")} value={`${result.remainingDays}${t("bp.days")}`} />
                <BpMetric
                  label={t("bp.currDaily")}
                  value={result.currentDailyAvg !== null ? fmtCurrency(result.currentDailyAvg, currency) : t("bp.noCurrDaily")}
                />
                <BpMetric
                  label={t("bp.reqDaily")}
                  value={result.requiredDailySpend !== null ? fmtCurrency(result.requiredDailySpend, currency) : t("bp.noReqDaily")}
                  primary
                />
                <BpMetric
                  label={t("bp.projectedBurn")}
                  value={result.projectedFinalBurnPct !== null ? fmtPct(result.projectedFinalBurnPct, 1) : "—"}
                />
              </div>

              {/* Projected spend */}
              {result.projectedFinalSpend !== null && (
                <div className="bp-projected">
                  <span className="bp-projected-lbl">{t("bp.projected")}</span>
                  <span className="bp-projected-val num">{fmtCurrency(result.projectedFinalSpend, currency)}</span>
                </div>
              )}

              <div className="privacy">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                  <path d="M6 8l1.5 1.5L10.5 6.5" />
                </svg>
                <span>{t("common.privacy")}</span>
              </div>
            </>
          ) : (
            <div className="bp-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span>{t("bp.noResult")}</span>
            </div>
          )}
        </div>
      </div>

      <Faq slug="ad-budget-pacing-calculator" />
      <RelatedTools slug="ad-budget-pacing-calculator" />
    </>
  );
}

function BpField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bp-field">
      <span className="bp-field-lbl">{label}</span>
      <span className="bp-field-input">{children}</span>
      {hint && <span className="bp-field-hint">{hint}</span>}
    </div>
  );
}

function BpMetric({ label, value, primary, accent }: { label: string; value: string; primary?: boolean; accent?: string }) {
  return (
    <div className={`bp-metric${primary ? " primary" : ""}`}>
      <div className={`bm-val num${accent ? ` accent-${accent}` : ""}`}>{value}</div>
      <div className="bm-lbl">{label}</div>
    </div>
  );
}

function ProgressBar({ label, pct, value, color }: { label: string; pct: number; value: string; color: string }) {
  return (
    <div className="bp-bar-row">
      <div className="bp-bar-top">
        <span className="bp-bar-lbl">{label}</span>
        <span className="bp-bar-val num">{value}</span>
      </div>
      <div className="bar">
        <i style={{ width: Math.min(100, Math.max(0, pct)) + "%", background: color }} />
      </div>
    </div>
  );
}
