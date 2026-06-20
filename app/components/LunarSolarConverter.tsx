"use client";

import { useMemo, useState } from "react";
import { Solar, Lunar } from "lunar-javascript";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";

const DICT: Dict = {
  ko: {
    "lc.modeSL": "양력 → 음력",
    "lc.modeLS": "음력 → 양력",
    "lc.year": "연도",
    "lc.month": "월",
    "lc.day": "일",
    "lc.leap": "윤달",
    "lc.solarLabel": "양력 날짜 입력",
    "lc.lunarLabel": "음력 날짜 입력",
    "lc.resultSolar": "양력",
    "lc.resultLunar": "음력",
    "lc.leapBadge": "윤달",
    "lc.ganzhi": "간지",
    "lc.zodiac": "띠",
    "lc.weekday": "요일",
    "lc.today": "오늘 날짜로",
    "lc.invalidDate": "유효하지 않은 날짜입니다.",
    "lc.outOfRange": "1901~2100년 범위를 벗어났습니다.",
    "lc.placeholder": "날짜를 선택하면 자동으로 변환됩니다.",
    "lc.leapHint": "이 달에는 윤달이 없습니다",
  },
  en: {
    "lc.modeSL": "Solar → Lunar",
    "lc.modeLS": "Lunar → Solar",
    "lc.year": "Year",
    "lc.month": "Month",
    "lc.day": "Day",
    "lc.leap": "Leap month",
    "lc.solarLabel": "Enter solar (Gregorian) date",
    "lc.lunarLabel": "Enter lunar date",
    "lc.resultSolar": "Solar",
    "lc.resultLunar": "Lunar",
    "lc.leapBadge": "Leap",
    "lc.ganzhi": "Ganjiji",
    "lc.zodiac": "Zodiac",
    "lc.weekday": "Day of week",
    "lc.today": "Use today",
    "lc.invalidDate": "Invalid date.",
    "lc.outOfRange": "Date is outside the 1901–2100 range.",
    "lc.placeholder": "Select a date to convert.",
    "lc.leapHint": "No intercalation month this month",
  },
};

const MONTHS_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS_KO = ["일","월","화","수","목","금","토"];
const WEEKDAYS_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// GanZhi Chinese → Korean pronunciation map
const GAN_KO: Record<string, string> = {
  甲:"갑",乙:"을",丙:"병",丁:"정",戊:"무",己:"기",庚:"경",辛:"신",壬:"임",癸:"계",
};
const ZHI_KO: Record<string, string> = {
  子:"자",丑:"축",寅:"인",卯:"묘",辰:"진",巳:"사",午:"오",未:"미",申:"신",酉:"유",戌:"술",亥:"해",
};
const ZODIAC_KO: Record<string, string> = {
  鼠:"쥐",牛:"소",虎:"호랑이",兔:"토끼",龙:"용",蛇:"뱀",马:"말",羊:"양",猴:"원숭이",鸡:"닭",狗:"개",猪:"돼지",
};
const ZODIAC_EN: Record<string, string> = {
  鼠:"Rat",牛:"Ox",虎:"Tiger",兔:"Rabbit",龙:"Dragon",蛇:"Snake",马:"Horse",羊:"Goat",猴:"Monkey",鸡:"Rooster",狗:"Dog",猪:"Pig",
};

function translateGanzhi(gz: string, lang: "ko" | "en"): string {
  if (lang === "en") return gz;
  return gz.split("").map(c => GAN_KO[c] ?? ZHI_KO[c] ?? c).join("");
}

function translateZodiac(z: string, lang: "ko" | "en"): string {
  return lang === "ko" ? (ZODIAC_KO[z] ?? z) : (ZODIAC_EN[z] ?? z);
}

function todaySolar() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function solarMonthDays(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// Check if a given lunar year+month has an intercalation version
function hasLeapMonth(lunarYear: number, lunarMonth: number): boolean {
  try {
    const l = Lunar.fromYmd(lunarYear, -lunarMonth, 1);
    const s = l.getSolar();
    return s.getYear() >= 1901 && s.getYear() <= 2100;
  } catch {
    return false;
  }
}

type Mode = "solar-to-lunar" | "lunar-to-solar";

type ConvertResult =
  | { ok: true; year: number; month: number; day: number; isLeap: boolean; ganzhiYear: string; zodiac: string; weekday?: number }
  | { ok: false; error: string };

function convertSolarToLunar(year: number, month: number, day: number): ConvertResult {
  try {
    if (year < 1901 || year > 2100) return { ok: false, error: "outOfRange" };
    const solar = Solar.fromDate(new Date(year, month - 1, day));
    const lunar = solar.getLunar();
    const lm = lunar.getMonth();
    const isLeap = lm < 0;
    return {
      ok: true,
      year: lunar.getYear(),
      month: Math.abs(lm),
      day: lunar.getDay(),
      isLeap,
      ganzhiYear: lunar.getYearInGanZhi(),
      zodiac: lunar.getYearShengXiao(),
      weekday: solar.getWeek(),
    };
  } catch {
    return { ok: false, error: "invalidDate" };
  }
}

function convertLunarToSolar(year: number, month: number, day: number, isLeap: boolean): ConvertResult {
  try {
    if (year < 1901 || year > 2100) return { ok: false, error: "outOfRange" };
    const lunarMonth = isLeap ? -month : month;
    const lunar = Lunar.fromYmd(year, lunarMonth, day);
    const solar = lunar.getSolar();
    if (solar.getYear() < 1901 || solar.getYear() > 2100) return { ok: false, error: "outOfRange" };
    return {
      ok: true,
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      isLeap: false,
      ganzhiYear: lunar.getYearInGanZhi(),
      zodiac: lunar.getYearShengXiao(),
      weekday: solar.getWeek(),
    };
  } catch {
    return { ok: false, error: "invalidDate" };
  }
}

export default function LunarSolarConverter() {
  const { lang } = useLang();
  const t = useT(DICT);

  const today = todaySolar();
  const [mode, setMode] = useState<Mode>("solar-to-lunar");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [isLeap, setIsLeap] = useState(false);

  // Clamp day when month/year changes
  const maxDay = mode === "solar-to-lunar"
    ? solarMonthDays(year, month)
    : 30; // lunar months are max 30 days
  const safeDay = clamp(day, 1, maxDay);

  // Check if current month has a leap version (for lunar→solar mode)
  const leapAvailable = useMemo(() => {
    if (mode !== "lunar-to-solar") return false;
    return hasLeapMonth(year, month);
  }, [mode, year, month]);

  // Auto-disable leap if not available
  const effectiveLeap = isLeap && leapAvailable;

  const result: ConvertResult = useMemo(() => {
    if (mode === "solar-to-lunar") {
      return convertSolarToLunar(year, month, safeDay);
    } else {
      return convertLunarToSolar(year, month, safeDay, effectiveLeap);
    }
  }, [mode, year, month, safeDay, effectiveLeap]);

  function resetToToday() {
    const t2 = todaySolar();
    setYear(t2.year);
    setMonth(t2.month);
    setDay(t2.day);
    setIsLeap(false);
    setMode("solar-to-lunar");
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    setIsLeap(false);
    // Reset to today in solar mode when switching
    if (m === "solar-to-lunar") {
      setYear(today.year);
      setMonth(today.month);
      setDay(today.day);
    }
  }

  const monthsLabel = lang === "ko" ? MONTHS_KO : MONTHS_EN;
  // weekday of the SOLAR date (input for s→l, output for l→s)
  const weekdayLabel = result.ok && result.weekday !== undefined
    ? (lang === "ko" ? WEEKDAYS_KO[result.weekday] + "요일" : WEEKDAYS_EN[result.weekday])
    : null;

  const yearOptions = [];
  for (let y = 1901; y <= 2100; y++) yearOptions.push(y);

  return (
    <>
      <PageHead slug="lunar-solar-converter" />

      <div className="lc-work">
        {/* Mode toggle */}
        <div className="lc-mode-bar">
          <button
            className={`lc-mode-btn${mode === "solar-to-lunar" ? " is-active" : ""}`}
            onClick={() => handleModeChange("solar-to-lunar")}
          >
            {t("lc.modeSL")}
          </button>
          <button
            className={`lc-mode-btn${mode === "lunar-to-solar" ? " is-active" : ""}`}
            onClick={() => handleModeChange("lunar-to-solar")}
          >
            {t("lc.modeLS")}
          </button>
          <button className="lc-today-btn" onClick={resetToToday}>
            {t("lc.today")}
          </button>
        </div>

        <div className="lc-body">
          {/* Input card */}
          <div className="lc-input-card">
            <div className="lc-card-head">
              <span className="lbl">{mode === "solar-to-lunar" ? t("lc.solarLabel") : t("lc.lunarLabel")}</span>
            </div>
            <div className="lc-fields">
              {/* Year */}
              <div className="lc-field-group">
                <label className="lc-field-label">{t("lc.year")}</label>
                <select
                  className="lc-select lc-select-year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}{lang === "ko" ? "년" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="lc-field-group">
                <label className="lc-field-label">{t("lc.month")}</label>
                <select
                  className="lc-select"
                  value={month}
                  onChange={(e) => { setMonth(Number(e.target.value)); setIsLeap(false); }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {lang === "ko" ? `${m}월` : monthsLabel[m - 1]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div className="lc-field-group">
                <label className="lc-field-label">{t("lc.day")}</label>
                <select
                  className="lc-select"
                  value={safeDay}
                  onChange={(e) => setDay(Number(e.target.value))}
                >
                  {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{lang === "ko" ? `${d}일` : d}</option>
                  ))}
                </select>
              </div>

              {/* Leap month toggle (lunar→solar only) */}
              {mode === "lunar-to-solar" && (
                <div className="lc-leap-row">
                  <label className={`lc-leap-toggle${!leapAvailable ? " disabled" : ""}`}>
                    <input
                      type="checkbox"
                      checked={effectiveLeap}
                      disabled={!leapAvailable}
                      onChange={(e) => setIsLeap(e.target.checked)}
                    />
                    <span className="lc-leap-track" />
                    <span className="lc-leap-lbl">{t("lc.leap")}</span>
                  </label>
                  {!leapAvailable && (
                    <span className="lc-leap-hint">{t("lc.leapHint")}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Result card */}
          <div className="lc-result-card">
            {result.ok ? (
              <>
                <div className="lc-result-main">
                  <div className="lc-result-label">
                    {mode === "solar-to-lunar" ? t("lc.resultLunar") : t("lc.resultSolar")}
                  </div>
                  <div className="lc-result-date">
                    {mode === "solar-to-lunar" ? (
                      <>
                        <span className="lc-result-year num">{result.year}</span>
                        <span className="lc-result-sep">{lang === "ko" ? "년 " : "–"}</span>
                        {result.isLeap && (
                          <span className="lc-leap-badge">{t("lc.leapBadge")}</span>
                        )}
                        <span className="lc-result-month num">{result.month}</span>
                        <span className="lc-result-sep">{lang === "ko" ? "월 " : "–"}</span>
                        <span className="lc-result-day num">{result.day}</span>
                        {lang === "ko" && <span className="lc-result-sep">일</span>}
                      </>
                    ) : (
                      <>
                        <span className="lc-result-year num">{result.year}</span>
                        <span className="lc-result-sep">{lang === "ko" ? "년 " : "–"}</span>
                        <span className="lc-result-month num">{result.month}</span>
                        <span className="lc-result-sep">{lang === "ko" ? "월 " : "–"}</span>
                        <span className="lc-result-day num">{result.day}</span>
                        {lang === "ko" && <span className="lc-result-sep">일</span>}
                      </>
                    )}
                  </div>
                  {weekdayLabel && mode === "lunar-to-solar" && (
                    <div className="lc-weekday">{weekdayLabel}</div>
                  )}
                </div>

                <div className="lc-result-meta">
                  <div className="lc-meta-row">
                    <span className="lc-meta-label">{t("lc.ganzhi")}</span>
                    <span className="lc-meta-value num">
                      {translateGanzhi(result.ganzhiYear, lang)}년
                      <span className="lc-meta-chinese"> ({result.ganzhiYear})</span>
                    </span>
                  </div>
                  <div className="lc-meta-row">
                    <span className="lc-meta-label">{t("lc.zodiac")}</span>
                    <span className="lc-meta-value">
                      {translateZodiac(result.zodiac, lang)}
                      <span className="lc-meta-chinese"> ({result.zodiac})</span>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="lc-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>{t(`lc.${result.error}` as Parameters<typeof t>[0]) || result.error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="privacy">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
            <path d="M6 8l1.5 1.5L10.5 6.5" />
          </svg>
          <span>{t("common.privacy")}</span>
        </div>
      </div>

      <Faq slug="lunar-solar-converter" />
      <RelatedTools slug="lunar-solar-converter" />
    </>
  );
}
