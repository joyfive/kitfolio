"use client";

import { useState } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useT, type Dict } from "../lib/i18n";

const DICT: Dict = {
  ko: {
    "tv.inputLabel": "시간 입력",
    "tv.basisLabel": "계산 기준",
    "tv.basisCalendar": "캘린더 기준",
    "tv.basisWork": "근무 기준",
    "tv.basisCalendarSub": "24시간/일 · 7일/주",
    "tv.basisWorkSub": "8시간/일 · 5일/주",
    "tv.resultsTitle": "변환 결과",
    "tv.units.seconds": "초",
    "tv.units.minutes": "분",
    "tv.units.hours": "시간",
    "tv.units.days": "일",
    "tv.units.weeks": "주",
    "tv.units.months": "개월",
    "tv.units.years": "년",
    "tv.note.calendar": "캘린더 기준: 1일 = 24시간, 1주 = 7일, 1개월 ≈ 30.44일",
    "tv.note.work": "근무 기준: 1일 = 8시간, 1주 = 40시간, 1개월 ≈ 21.75근무일",
  },
  en: {
    "tv.inputLabel": "Enter time",
    "tv.basisLabel": "Calculation basis",
    "tv.basisCalendar": "Calendar",
    "tv.basisWork": "Work",
    "tv.basisCalendarSub": "24h/day · 7d/week",
    "tv.basisWorkSub": "8h/day · 5d/week",
    "tv.resultsTitle": "Conversions",
    "tv.units.seconds": "Seconds",
    "tv.units.minutes": "Minutes",
    "tv.units.hours": "Hours",
    "tv.units.days": "Days",
    "tv.units.weeks": "Weeks",
    "tv.units.months": "Months",
    "tv.units.years": "Years",
    "tv.note.calendar": "Calendar basis: 1 day = 24h, 1 week = 7 days, 1 month ≈ 30.44 days",
    "tv.note.work": "Work basis: 1 day = 8h, 1 week = 40h, 1 month ≈ 21.75 working days",
  },
};

type Unit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
type Basis = "calendar" | "work";

const UNITS: Unit[] = ["seconds", "minutes", "hours", "days", "weeks", "months", "years"];

// Conversion: everything in seconds
const CALENDAR: Record<Unit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
  months: 86400 * 30.4375, // 365.25/12 days
  years: 86400 * 365.25,
};

const WORK: Record<Unit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 3600 * 8,
  weeks: 3600 * 40,
  months: 3600 * 8 * 21.75, // 261 working days / 12
  years: 3600 * 8 * 261,
};

function convert(value: number, fromUnit: Unit, basis: Basis): Record<Unit, number> {
  const table = basis === "calendar" ? CALENDAR : WORK;
  const inSeconds = value * table[fromUnit];
  const result: Partial<Record<Unit, number>> = {};
  for (const u of UNITS) {
    result[u] = inSeconds / table[u];
  }
  return result as Record<Unit, number>;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e9) return n.toExponential(2);
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (Math.abs(n) >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

export default function TimeConverter() {
  const t = useT(DICT);

  const [value, setValue] = useState("120");
  const [fromUnit, setFromUnit] = useState<Unit>("hours");
  const [basis, setBasis] = useState<Basis>("work");
  const [copied, setCopied] = useState<Unit | null>(null);

  const numVal = parseFloat(value) || 0;
  const results = convert(numVal, fromUnit, basis);

  async function copy(text: string, unit: Unit) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(unit);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <>
      <PageHead slug="time-converter" />
      <div className="tv-work">
        {/* Left: inputs */}
        <div className="tv-inputs">
          <div className="tv-inputs-head">
            <span className="lbl">{t("tv.inputLabel")}</span>
          </div>
          <div className="tv-form">
            {/* main input: number + unit selector */}
            <div className="tv-main-input">
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <div className="tv-main-input-sep" />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as Unit)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t(`tv.units.${u}` as Parameters<typeof t>[0])}
                  </option>
                ))}
              </select>
            </div>

            {/* basis segmented control */}
            <div>
              <div className="tv-basis-label">{t("tv.basisLabel")}</div>
              <div className="seg" style={{ marginTop: "10px" }}>
                <button
                  className={basis === "calendar" ? "is-active" : ""}
                  onClick={() => setBasis("calendar")}
                >
                  <span>{t("tv.basisCalendar")}</span>
                  <span
                    style={{
                      fontWeight: 400,
                      color: "inherit",
                      opacity: 0.7,
                      fontSize: "11px",
                    }}
                  >
                    {t("tv.basisCalendarSub")}
                  </span>
                </button>
                <button
                  className={basis === "work" ? "is-active" : ""}
                  onClick={() => setBasis("work")}
                >
                  <span>{t("tv.basisWork")}</span>
                  <span
                    style={{
                      fontWeight: 400,
                      color: "inherit",
                      opacity: 0.7,
                      fontSize: "11px",
                    }}
                  >
                    {t("tv.basisWorkSub")}
                  </span>
                </button>
              </div>
            </div>

            {/* basis note */}
            <div className="tv-basis-note">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 7v4.5M8 5.5v.5" />
              </svg>
              <span>
                {t(
                  basis === "calendar"
                    ? "tv.note.calendar"
                    : "tv.note.work",
                )}
              </span>
            </div>

            <div className="privacy">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
        </div>

        {/* Right: results grid */}
        <div className="tv-results">
          <div className="tv-results-title">{t("tv.resultsTitle")}</div>
          <div className="tv-grid">
            {UNITS.map((u) => {
              const displayVal = fmt(results[u]);
              return (
                <div
                  className={`tv-grid-row${u === fromUnit ? " is-source" : ""}`}
                  key={u}
                >
                  <span className="tv-unit">
                    {t(`tv.units.${u}` as Parameters<typeof t>[0])}
                  </span>
                  <span className="tv-val">{displayVal}</span>
                  <button
                    className={`tv-copy${copied === u ? " copied" : ""}`}
                    onClick={() => copy(displayVal, u)}
                    aria-label="copy"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="4" y="4" width="8.5" height="10" rx="1.5" />
                      <path d="M3.5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v.5" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Faq slug="time-converter" />
      <RelatedTools slug="time-converter" />
    </>
  );
}
