"use client";

import { useEffect, useMemo, useState } from "react";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import { calcFlexWork } from "../lib/flexwork";
import { hasHolidayData } from "../lib/holidays";

// 컨트롤 마이크로카피(레이블·단위)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "fw.inputHead": "근무 조건",
    "fw.reset": "초기화",
    "fw.year": "연도",
    "fw.month": "월",
    "fw.daily": "1일 소정근로",
    "fw.leaveGroup": "사용한 휴가",
    "fw.full": "연차",
    "fw.half": "반차",
    "fw.hour": "시간차",
    "fw.worked": "현재 누적 근무시간",
    "fw.excludeHol": "공휴일 제외",
    "fw.includeToday": "남은 영업일에 오늘 포함",
    "fw.format": "표시",
    "fw.dec": "소수점",
    "fw.hm": "시:분",
    "fw.requiredDaily": "남은 기간 하루 평균",
    "fw.requiredSub": "남은 영업일마다 이만큼 일하면 목표 달성",
    "fw.balance": "정시 근무 기준",
    "fw.balanceSub": "남은 영업일을 매일 소정근로시간만큼 채울 때",
    "fw.surplus": "여유",
    "fw.deficit": "부족",
    "fw.onTrack": "정확히 목표 달성",
    "fw.actualTarget": "이번 달 목표",
    "fw.workedM": "누적 근무",
    "fw.remaining": "남은 목표",
    "fw.remainingDays": "남은 영업일",
    "fw.breakdown": "계산 내역",
    "fw.businessDays": "이번 달 영업일",
    "fw.baseTarget": "월 기본 목표",
    "fw.leaveDeduction": "휴가 차감",
    "fw.progress": "진행률",
    "fw.doneMsg": "남은 영업일이 없어요. 이번 달 마감 기준 결과입니다.",
    "fw.holOn": "{y}년 공휴일 자동 반영",
    "fw.holOff": "{y}년 공휴일 데이터가 없어 주말만 제외했어요",
    "fw.u.days": "일",
    "fw.u.times": "회",
    "fw.u.hours": "시간",
    "fw.u.minutes": "분",
    "fw.u.h": "시간",
    "fw.u.m": "분",
    "fw.u.d": "일",
  },
  en: {
    "fw.inputHead": "Your schedule",
    "fw.reset": "Reset",
    "fw.year": "Year",
    "fw.month": "Month",
    "fw.daily": "Daily hours",
    "fw.leaveGroup": "Leave used",
    "fw.full": "Full-day",
    "fw.half": "Half-day",
    "fw.hour": "Hourly",
    "fw.worked": "Hours worked so far",
    "fw.excludeHol": "Exclude public holidays",
    "fw.includeToday": "Count today as a remaining day",
    "fw.format": "Format",
    "fw.dec": "Decimal",
    "fw.hm": "H:M",
    "fw.requiredDaily": "Required daily average",
    "fw.requiredSub": "per remaining business day to hit your target",
    "fw.balance": "vs. standard hours",
    "fw.balanceSub": "if you work full daily hours on every remaining day",
    "fw.surplus": "ahead",
    "fw.deficit": "behind",
    "fw.onTrack": "Right on target",
    "fw.actualTarget": "Monthly target",
    "fw.workedM": "Worked",
    "fw.remaining": "Remaining",
    "fw.remainingDays": "Business days left",
    "fw.breakdown": "How it adds up",
    "fw.businessDays": "Business days this month",
    "fw.baseTarget": "Base target",
    "fw.leaveDeduction": "Leave deducted",
    "fw.progress": "Progress",
    "fw.doneMsg": "No business days left: this reflects the month's final tally.",
    "fw.holOn": "{y} public holidays applied automatically",
    "fw.holOff": "No holiday data for {y}: weekends only",
    "fw.u.days": "days",
    "fw.u.times": "×",
    "fw.u.hours": "hrs",
    "fw.u.minutes": "min",
    "fw.u.h": "h",
    "fw.u.m": "m",
    "fw.u.d": "d",
  },
};

type Fmt = "dec" | "hm";

const DEFAULTS = {
  year: "",
  month: "",
  daily: "8",
  full: "0",
  half: "0",
  hour: "0",
  workedH: "0",
  workedM: "0",
};

function num(s: string, fallback = 0): number {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : fallback;
}

export default function FlexWorkCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [year, setYear] = useState(DEFAULTS.year);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [daily, setDaily] = useState(DEFAULTS.daily);
  const [full, setFull] = useState(DEFAULTS.full);
  const [half, setHalf] = useState(DEFAULTS.half);
  const [hour, setHour] = useState(DEFAULTS.hour);
  const [workedH, setWorkedH] = useState(DEFAULTS.workedH);
  const [workedM, setWorkedM] = useState(DEFAULTS.workedM);
  const [excludeHol, setExcludeHol] = useState(true);
  const [includeToday, setIncludeToday] = useState(true);
  const [fmt, setFmt] = useState<Fmt>("dec");
  const [today, setToday] = useState<Date | null>(null);

  // 현재 날짜는 마운트 후에 주입 (SSR/하이드레이션 불일치 방지)
  useEffect(() => {
    const now = new Date();
    setToday(now);
    setYear((y) => y || String(now.getFullYear()));
    setMonth((m) => m || String(now.getMonth() + 1));
  }, []);

  function reset() {
    const now = today ?? new Date();
    setYear(String(now.getFullYear()));
    setMonth(String(now.getMonth() + 1));
    setDaily(DEFAULTS.daily);
    setFull(DEFAULTS.full);
    setHalf(DEFAULTS.half);
    setHour(DEFAULTS.hour);
    setWorkedH(DEFAULTS.workedH);
    setWorkedM(DEFAULTS.workedM);
    setExcludeHol(true);
    setIncludeToday(true);
  }

  const yNum = Math.round(num(year, today?.getFullYear() ?? 2026));
  const mNum = Math.min(12, Math.max(1, Math.round(num(month, 1))));

  const r = useMemo(() => {
    const base = today ?? new Date(yNum, mNum - 1, 1);
    return calcFlexWork({
      year: yNum,
      month: mNum,
      dailyHours: Math.max(0, num(daily, 8)),
      fullLeave: Math.max(0, num(full)),
      halfLeave: Math.max(0, num(half)),
      hourLeave: Math.max(0, num(hour)),
      worked: Math.max(0, num(workedH) + num(workedM) / 60),
      excludeHolidays: excludeHol,
      includeToday,
      today: base,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yNum, mNum, daily, full, half, hour, workedH, workedM, excludeHol, includeToday, today]);

  // ── 시간 포맷 (소수점 / 시:분) ──
  function fmtH(h: number, withSign = false): string {
    const neg = h < 0;
    const a = Math.abs(h);
    const sign = neg ? "-" : withSign && h > 0 ? "+" : "";
    if (fmt === "hm") {
      const totalMin = Math.round(a * 60);
      const hh = Math.floor(totalMin / 60);
      const mm = totalMin % 60;
      const parts: string[] = [];
      if (hh > 0) parts.push(`${hh}${t("fw.u.h")}`);
      if (mm > 0) parts.push(`${mm}${t("fw.u.m")}`);
      if (parts.length === 0) parts.push(`0${t("fw.u.h")}`);
      return sign + parts.join(" ");
    }
    const v = Math.round(a * 10) / 10;
    return `${sign}${v}${t("fw.u.hours")}`;
  }

  const progressPct =
    r.actualTarget > 0
      ? Math.min(100, Math.max(0, (r.worked / r.actualTarget) * 100))
      : r.worked > 0
        ? 100
        : 0;

  const balanceState =
    Math.abs(r.balance) < 0.05 ? "track" : r.balance > 0 ? "surplus" : "deficit";

  const holNote = excludeHol
    ? hasHolidayData(yNum)
      ? t("fw.holOn").replace("{y}", String(yNum))
      : t("fw.holOff").replace("{y}", String(yNum))
    : "";

  return (
    <>
      <PageHead slug="flex-work-calculator" />

      <div className="fw-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("fw.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("fw.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <div className="fw-row fw-row-2">
              <Field label={t("fw.year")}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={2000}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field>
              <Field label={t("fw.month")}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </Field>
            </div>

            <Field label={t("fw.daily")} suffix={t("fw.u.hours")}>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
              />
            </Field>

            <div className="fw-group-label">{t("fw.leaveGroup")}</div>
            <div className="fw-row fw-row-3">
              <Field label={t("fw.full")} suffix={t("fw.u.days")}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={full}
                  onChange={(e) => setFull(e.target.value)}
                />
              </Field>
              <Field label={t("fw.half")} suffix={t("fw.u.times")}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={half}
                  onChange={(e) => setHalf(e.target.value)}
                />
              </Field>
              <Field label={t("fw.hour")} suffix={t("fw.u.hours")}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                />
              </Field>
            </div>

            <div className="fw-field">
              <span className="fw-field-lbl">{t("fw.worked")}</span>
              <div className="fw-dual">
                <span className="fw-field-input">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={workedH}
                    onChange={(e) => setWorkedH(e.target.value)}
                  />
                  <span className="fw-field-suffix">{t("fw.u.hours")}</span>
                </span>
                <span className="fw-field-input">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={59}
                    step={1}
                    value={workedM}
                    onChange={(e) => setWorkedM(e.target.value)}
                  />
                  <span className="fw-field-suffix">{t("fw.u.minutes")}</span>
                </span>
              </div>
            </div>

            <div className="fw-checks">
              <label className="fw-check">
                <input
                  type="checkbox"
                  checked={excludeHol}
                  onChange={(e) => setExcludeHol(e.target.checked)}
                />
                <span>{t("fw.excludeHol")}</span>
              </label>
              <label className="fw-check">
                <input
                  type="checkbox"
                  checked={includeToday}
                  onChange={(e) => setIncludeToday(e.target.checked)}
                />
                <span>{t("fw.includeToday")}</span>
              </label>
            </div>

            <div className="fw-fmt">
              <span className="fw-fmt-lbl">{t("fw.format")}</span>
              <div className="seg">
                <button
                  className={fmt === "dec" ? "is-active" : ""}
                  onClick={() => setFmt("dec")}
                >
                  {t("fw.dec")}
                </button>
                <button
                  className={fmt === "hm" ? "is-active" : ""}
                  onClick={() => setFmt("hm")}
                >
                  {t("fw.hm")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          <div className="fw-emph">
            <div className="fw-emph-card primary">
              <div className="ec-label">{t("fw.requiredDaily")}</div>
              <div className="ec-value num">
                {r.requiredDaily === null ? "—" : fmtH(r.requiredDaily)}
              </div>
              <div className="ec-sub">{t("fw.requiredSub")}</div>
            </div>
            <div className={"fw-emph-card balance " + balanceState}>
              <div className="ec-label">{t("fw.balance")}</div>
              <div className="ec-value num">
                {balanceState === "track"
                  ? t("fw.onTrack")
                  : `${fmtH(r.balance, true)} ${
                      r.balance > 0 ? t("fw.surplus") : t("fw.deficit")
                    }`}
              </div>
              <div className="ec-sub">{t("fw.balanceSub")}</div>
            </div>
          </div>

          <div className="fw-metrics">
            <div className="metric">
              <div className="mv num">{fmtH(r.actualTarget)}</div>
              <div className="ml">{t("fw.actualTarget")}</div>
            </div>
            <div className="metric">
              <div className="mv num">{fmtH(r.worked)}</div>
              <div className="ml">{t("fw.workedM")}</div>
            </div>
            <div className="metric">
              <div className="mv num">{fmtH(r.remaining)}</div>
              <div className="ml">{t("fw.remaining")}</div>
            </div>
            <div className="metric">
              <div className="mv num">
                {r.remainingDays}
                <span className="unit">{t("fw.u.d")}</span>
              </div>
              <div className="ml">{t("fw.remainingDays")}</div>
            </div>
          </div>

          <div className="fw-progress">
            <div className="fw-progress-top">
              <span className="l">{t("fw.progress")}</span>
              <span className="v num">
                {fmtH(r.worked)} / {fmtH(r.actualTarget)} ·{" "}
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="bar">
              <i style={{ width: progressPct + "%" }} />
            </div>
            {r.remainingDays === 0 && (
              <p className="fw-done">{t("fw.doneMsg")}</p>
            )}
          </div>

          <div className="fw-breakdown">
            <h3>{t("fw.breakdown")}</h3>
            <div className="bd-row">
              <span className="k">{t("fw.businessDays")}</span>
              <span className="v num">
                {r.businessDays}
                {t("fw.u.d")}
              </span>
            </div>
            <div className="bd-row">
              <span className="k">{t("fw.baseTarget")}</span>
              <span className="v num">{fmtH(r.baseTarget)}</span>
            </div>
            <div className="bd-row sub">
              <span className="k">
                {t("fw.full")} · {t("fw.half")} · {t("fw.hour")}
              </span>
              <span className="v num">−{fmtH(r.leaveDeduction)}</span>
            </div>
            <div className="bd-row total">
              <span className="k">{t("fw.actualTarget")}</span>
              <span className="v num">{fmtH(r.actualTarget)}</span>
            </div>
            {holNote && (
              <p className="fw-holnote">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
                  <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
                </svg>
                <span>{holNote}</span>
              </p>
            )}
          </div>

          <div className="privacy">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
              <path d="M6 8l1.5 1.5L10.5 6.5" />
            </svg>
            <span>{t("common.privacy")}</span>
          </div>
        </div>
      </div>

      <ToolGuide slug="flex-work-calculator" />
      <Faq slug="flex-work-calculator" />
      <RelatedTools slug="flex-work-calculator" />
    </>
  );
}

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="fw-field">
      <span className="fw-field-lbl">{label}</span>
      <span className="fw-field-input">
        {children}
        {suffix && <span className="fw-field-suffix">{suffix}</span>}
      </span>
    </label>
  );
}
