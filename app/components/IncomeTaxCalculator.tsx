"use client";

import { useMemo, useState } from "react";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  calculate,
  MAX_AMOUNT,
  type MethodKind,
  type MethodResult,
  type Rates,
} from "../lib/incometax/calculator";
import { TAX_YEARS, policyFor, type TaxYear } from "../lib/incometax/policy";
import { noticeFor } from "../lib/incometax/expense-rates";
import { INCOMETAX_VERIFIED_AT } from "../lib/incometax/sources";
import { formatNumber, formatWon } from "../lib/salary/formatter";

const SLUG = "income-tax-calculator";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "it.inputHead": "계산 조건",
    "it.reset": "초기화",
    "it.year": "귀속연도",
    "it.yearSuffix": "년 소득",
    "it.revenue": "올해 수입금액",
    "it.revenueHint": "3.3%를 떼기 전 1년 동안 받은 금액의 합계입니다.",
    "it.prevRevenue": "직전연도 수입금액",
    "it.isNew": "올해 처음 시작했어요 (신규사업자)",
    "it.prevHint": "단순경비율·기준경비율은 직전연도 수입으로 정해집니다.",
    "it.ratesHead": "업종 경비율",
    "it.industry": "업종코드",
    "it.custom": "직접 입력",
    "it.simple": "단순경비율",
    "it.simpleExcess": "4천만원 초과분",
    "it.standard": "기준경비율",
    "it.ratesHint": "홈택스 '기준·단순경비율 조회'에서 내 업종코드의 값을 확인해 바꿔 넣을 수 있습니다.",
    "it.ratesEstimated": "{year}년 귀속 경비율은 아직 이 계산기에 반영되지 않아 {base}년 귀속 고시값으로 추정합니다.",
    "it.peopleHead": "공제",
    "it.dependents": "부양가족 (본인 제외)",
    "it.elderly": "70세 이상 (본인 포함)",
    "it.disabled": "장애인 (본인 포함)",
    "it.people": "명",
    "it.pension": "국민연금 납부액 (연간)",
    "it.advanced": "경비 · 기납부세액 직접 입력",
    "it.major": "주요경비 (기준경비율용)",
    "it.majorHint": "매입비용·임차료·인건비 중 증빙이 있는 금액만 넣습니다.",
    "it.actual": "실제 필요경비 (간편장부용)",
    "it.actualHint": "장부에 적을 수 있는 1년 경비 합계입니다. 비워 두면 간편장부는 계산하지 않습니다.",
    "it.prepaid": "원천징수된 소득세",
    "it.prepaidHint": "비워 두면 수입금액의 3%로 계산합니다. 지방소득세 0.3%는 따로 정산됩니다.",
    "it.optional": "선택",
    "it.won": "원",
    "it.empty": "올해 수입금액을 입력하면 5월 신고 예상 결과가 표시됩니다.",
    "it.refund": "5월 예상 환급",
    "it.owe": "5월 예상 추가 납부",
    "it.zero": "5월 정산 금액 없음",
    "it.subSplit": "소득세 {a} · 지방소득세 {b}",
    "it.byMethod": "{m} 기준",
    "it.determined": "결정세액 (소득세)",
    "it.local": "지방소득세",
    "it.prepaidCard": "이미 낸 세금 (3.3%)",
    "it.compareTitle": "신고 방식 비교",
    "it.col.method": "방식",
    "it.col.income": "소득금액",
    "it.col.tax": "결정세액",
    "it.col.total": "환급(−) · 납부(+)",
    "it.m.simple": "단순경비율",
    "it.m.standard": "기준경비율",
    "it.m.ledger": "간편장부",
    "it.tag.ok": "신고 가능",
    "it.tag.no": "해당 없음",
    "it.tag.best": "가장 유리",
    "it.ledgerEmpty": "실제 경비를 넣으면 계산",
    "it.why.prevOver": "직전연도 수입이 단순경비율 기준 {n} 이상이라 기준경비율로 신고합니다.",
    "it.why.currentOver": "올해 수입이 {n} 이상이라 단순경비율을 쓸 수 없습니다.",
    "it.why.simple": "단순경비율 대상이라 추계 신고는 단순경비율로 합니다. 기준경비율 행은 비교용입니다.",
    "it.doubleEntry":
      "직전연도 수입이 {n} 이상이면 복식부기의무자입니다. 추계 신고 시 기준경비율의 절반만 인정되고 가산세 규칙도 달라 이 계산기의 범위를 벗어납니다. 간편장부 행은 실제 경비 기준 참고값입니다.",
    "it.near": "직전연도 수입이 단순경비율 기준 {n}에 가깝습니다. 올해 수입이 이 기준을 넘으면 내년 신고는 기준경비율로 바뀌어 세금이 크게 오를 수 있습니다.",
    "it.penalty": "소규모사업자(직전연도 수입 {n} 미만 또는 신규)가 아니라 장부 없이 추계로 신고하면 무기장가산세 {p}이 붙습니다.",
    "it.capped": "기준경비율 소득금액이 단순경비율 소득금액의 {x}배를 넘어 상한이 적용됐습니다.",
    "it.breakEven": "실제 필요경비가 {e} 이상이면 간편장부로 신고하는 편이 {m}보다 유리하거나 같습니다.",
    "it.breakEvenNone": "이 수입에서는 실제 경비를 얼마로 잡아도 간편장부가 {m}보다 유리해지지 않습니다.",
    "it.breakEvenZero": "실제 경비가 0원이어도 간편장부가 {m}보다 유리하거나 같습니다 (무기장가산세 차이).",
    "it.detail": "계산 과정",
    "it.d.revenue": "수입금액",
    "it.d.expenses": "필요경비",
    "it.d.income": "사업소득금액",
    "it.d.deductions": "종합소득공제 (인적공제 + 국민연금)",
    "it.d.base": "과세표준",
    "it.d.computed": "산출세액",
    "it.d.credit": "표준세액공제",
    "it.d.penalty": "무기장가산세",
    "it.d.determined": "결정세액",
    "it.d.prepaid": "기납부세액 (원천징수 3%)",
    "it.d.payable": "소득세 환급(−) · 납부(+)",
    "it.d.local": "지방소득세 환급(−) · 납부(+)",
    "it.d.total": "합계",
    "it.basisTitle": "계산 기준",
    "it.basisRates": "세율",
    "it.basisRatesValue": "기본세율 6%~45% (8단계, 누진공제)",
    "it.basisNotice": "경비율",
    "it.basisVerified": "최근 검증",
    "it.basisNote": "결정세액과 지방소득세는 10원 미만을 버립니다. 지방소득세는 소득세 결정세액의 10%로 근사합니다.",
    "it.disclaimer":
      "3.3% 원천징수를 받은 인적용역 사업소득만 있는 경우의 참고용 예상 계산입니다. 근로·기타·금융소득 합산, 자녀·노란우산·연금계좌 공제, 결손금은 반영하지 않습니다. 실제 신고는 홈택스에서 하세요.",
  },
  en: {
    "it.inputHead": "Inputs",
    "it.reset": "Reset",
    "it.year": "Tax year",
    "it.yearSuffix": " income",
    "it.revenue": "Revenue this year",
    "it.revenueHint": "Total fees received during the year, before the 3.3% withholding.",
    "it.prevRevenue": "Revenue last year",
    "it.isNew": "I started this year (new business)",
    "it.prevHint": "Whether the simple or standard expense rate applies depends on last year's revenue.",
    "it.ratesHead": "Industry expense rates",
    "it.industry": "Industry code",
    "it.custom": "Enter manually",
    "it.simple": "Simple rate",
    "it.simpleExcess": "Over 40M won",
    "it.standard": "Standard rate",
    "it.ratesHint": "Look up your industry code under 'standard and simple expense rates' on Hometax and enter its values.",
    "it.ratesEstimated": "Rates for tax year {year} are not in this calculator yet, so the {base} published rates are used as an estimate.",
    "it.peopleHead": "Deductions",
    "it.dependents": "Dependents (excluding you)",
    "it.elderly": "Aged 70+ (including you)",
    "it.disabled": "With a disability (including you)",
    "it.people": "",
    "it.pension": "National pension paid (year)",
    "it.advanced": "Enter expenses and tax withheld",
    "it.major": "Major expenses (standard rate)",
    "it.majorHint": "Only purchases, rent and payroll backed by receipts.",
    "it.actual": "Actual expenses (simplified books)",
    "it.actualHint": "Total expenses you can record in a ledger. Leave blank to skip the simplified-books row.",
    "it.prepaid": "Income tax withheld",
    "it.prepaidHint": "Blank uses 3% of revenue. The 0.3% local income tax is settled separately.",
    "it.optional": "optional",
    "it.won": "KRW",
    "it.empty": "Enter this year's revenue to see your estimated May filing result.",
    "it.refund": "Estimated May refund",
    "it.owe": "Estimated May payment",
    "it.zero": "Nothing to settle in May",
    "it.subSplit": "Income tax {a} · local income tax {b}",
    "it.byMethod": "Using {m}",
    "it.determined": "Income tax due",
    "it.local": "Local income tax",
    "it.prepaidCard": "Already withheld (3.3%)",
    "it.compareTitle": "Filing methods compared",
    "it.col.method": "Method",
    "it.col.income": "Income",
    "it.col.tax": "Tax due",
    "it.col.total": "Refund (−) · pay (+)",
    "it.m.simple": "Simple rate",
    "it.m.standard": "Standard rate",
    "it.m.ledger": "Simplified books",
    "it.tag.ok": "Available",
    "it.tag.no": "Not for you",
    "it.tag.best": "Best",
    "it.ledgerEmpty": "Enter actual expenses",
    "it.why.prevOver": "Last year's revenue is at or above the {n} simple-rate threshold, so the standard rate applies.",
    "it.why.currentOver": "This year's revenue is {n} or more, so the simple rate cannot be used.",
    "it.why.simple": "You qualify for the simple rate, so an estimated return uses it. The standard-rate row is for comparison.",
    "it.doubleEntry":
      "With last year's revenue at {n} or more you must keep double-entry books. Estimated returns then get only half the standard rate and different penalties, which is outside this calculator. The simplified-books row is a reference based on actual expenses.",
    "it.near": "Last year's revenue is close to the {n} simple-rate threshold. If this year's revenue crosses it, next year's return moves to the standard rate and the tax can rise sharply.",
    "it.penalty": "You are not a small business (last year under {n}, or new), so filing an estimated return without books adds a {p} bookkeeping penalty.",
    "it.capped": "Standard-rate income exceeded {x} times the simple-rate income, so the cap was applied.",
    "it.breakEven": "With actual expenses of {e} or more, filing with simplified books is as good as or better than the {m}.",
    "it.breakEvenNone": "At this revenue, no level of actual expenses makes simplified books better than the {m}.",
    "it.breakEvenZero": "Even with zero expenses, simplified books are as good as or better than the {m} (because of the bookkeeping penalty).",
    "it.detail": "How this was calculated",
    "it.d.revenue": "Revenue",
    "it.d.expenses": "Expenses",
    "it.d.income": "Business income",
    "it.d.deductions": "Deductions (personal + national pension)",
    "it.d.base": "Tax base",
    "it.d.computed": "Calculated tax",
    "it.d.credit": "Standard tax credit",
    "it.d.penalty": "Bookkeeping penalty",
    "it.d.determined": "Tax due",
    "it.d.prepaid": "Already withheld (3%)",
    "it.d.payable": "Income tax refund (−) · pay (+)",
    "it.d.local": "Local income tax refund (−) · pay (+)",
    "it.d.total": "Total",
    "it.basisTitle": "Calculation basis",
    "it.basisRates": "Rates",
    "it.basisRatesValue": "Basic rates 6%-45% (8 brackets, progressive deduction)",
    "it.basisNotice": "Expense rates",
    "it.basisVerified": "Last verified",
    "it.basisNote": "Tax due and local income tax drop anything under 10 won. Local income tax is approximated as 10% of the income tax due.",
    "it.disclaimer":
      "A reference estimate for freelancers in Korea whose only income is personal-service business income with 3.3% withheld. Salary, other or financial income, child, Yellow Umbrella and pension account credits, and loss carry-forwards are not included. File the actual return on Hometax.",
  },
};

const DEFAULT_REVENUE = "30,000,000";
const DEFAULT_PREV = "28,000,000";

/** 숫자 문자열에서 숫자만 추출. 빈 값은 null */
function digitsOrNull(s: string): number | null {
  const clean = s.replace(/[^\d]/g, "");
  if (clean === "") return null;
  return Math.min(Number(clean), MAX_AMOUNT);
}
const digits = (s: string) => digitsOrNull(s) ?? 0;

/** 입력 중 천 단위 콤마 표시 (빈 값은 그대로) */
function withCommas(s: string): string {
  const clean = s.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
  return clean === "" ? "" : Math.min(Number(clean), MAX_AMOUNT).toLocaleString("en-US");
}

/** 한글 금액 보조 표기: 30,000,000 → "3,000만원" */
function koreanAmount(n: number): string {
  if (n < 10_000) return `${formatNumber(n)}원`;
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const rest = n % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${formatNumber(eok)}억`);
  if (man) parts.push(`${formatNumber(man)}만`);
  if (rest) parts.push(formatNumber(rest));
  return `${parts.join(" ")}원`;
}

/** 0.1% 단위 정수 ↔ 화면 문자열 ("64.1") */
const permilleToText = (p: number) => (p / 10).toFixed(1);
function textToPermille(s: string): number {
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1000, Math.round(n * 10)));
}

/** 부호 있는 금액: 환급은 −, 납부는 + */
function signedWon(n: number): string {
  if (n === 0) return "0원";
  return `${n < 0 ? "−" : "+"} ${formatWon(Math.abs(n))}`;
}

/** 만원 단위 표기 (기준금액 안내용) */
function manWon(n: number, lang: string): string {
  return lang === "ko" ? `${formatNumber(n / 10_000)}만원` : `${formatNumber(n)} won`;
}

export default function IncomeTaxCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [year, setYear] = useState<TaxYear>(TAX_YEARS[0]);
  const [revenue, setRevenue] = useState(DEFAULT_REVENUE);
  const [prevRevenue, setPrevRevenue] = useState(DEFAULT_PREV);
  const [isNew, setIsNew] = useState(false);
  const [industry, setIndustry] = useState<string>(() => noticeFor(TAX_YEARS[0]).notice.rates[0].code);
  const [rateText, setRateText] = useState(() => {
    const r = noticeFor(TAX_YEARS[0]).notice.rates[0];
    return {
      simple: permilleToText(r.simple),
      simpleExcess: permilleToText(r.simpleExcess),
      standard: permilleToText(r.standard),
    };
  });
  const [dependents, setDependents] = useState("0");
  const [elderly, setElderly] = useState("0");
  const [disabled, setDisabled] = useState("0");
  const [pension, setPension] = useState("");
  const [major, setMajor] = useState("");
  const [actual, setActual] = useState("");
  const [prepaid, setPrepaid] = useState("");
  const [selected, setSelected] = useState<MethodKind | null>(null);

  const { notice, estimated } = noticeFor(year);
  const policy = policyFor(year);

  function pickIndustry(code: string) {
    setIndustry(code);
    const r = notice.rates.find((x) => x.code === code);
    if (r) {
      setRateText({
        simple: permilleToText(r.simple),
        simpleExcess: permilleToText(r.simpleExcess),
        standard: permilleToText(r.standard),
      });
    }
  }

  function editRate(key: keyof Rates, v: string) {
    setIndustry("custom");
    setRateText((prev) => ({ ...prev, [key]: v.replace(/[^\d.]/g, "") }));
  }

  function reset() {
    setYear(TAX_YEARS[0]);
    setRevenue(DEFAULT_REVENUE);
    setPrevRevenue(DEFAULT_PREV);
    setIsNew(false);
    pickIndustry(noticeFor(TAX_YEARS[0]).notice.rates[0].code);
    setDependents("0");
    setElderly("0");
    setDisabled("0");
    setPension("");
    setMajor("");
    setActual("");
    setPrepaid("");
    setSelected(null);
  }

  const revenueValue = digits(revenue);

  const result = useMemo(() => {
    if (revenueValue <= 0) return null;
    return calculate({
      year,
      revenue: revenueValue,
      prevRevenue: digits(prevRevenue),
      isNew,
      rates: {
        simple: textToPermille(rateText.simple),
        simpleExcess: textToPermille(rateText.simpleExcess),
        standard: textToPermille(rateText.standard),
      },
      majorExpenses: digits(major),
      actualExpenses: digitsOrNull(actual),
      dependents: digits(dependents),
      elderly: digits(elderly),
      disabled: digits(disabled),
      pension: digits(pension),
      prepaid: digitsOrNull(prepaid),
    });
  }, [year, revenueValue, prevRevenue, isNew, rateText, major, actual, dependents, elderly, disabled, pension, prepaid]);

  const byKind = (k: MethodKind | null): MethodResult | undefined =>
    result?.methods.find((m) => m.kind === k);
  const shownKind = selected && byKind(selected) ? selected : result?.best ?? null;
  const shown = byKind(shownKind);
  const el = result?.eligibility;
  const estimateName = result?.estimateKind ? t(`it.m.${result.estimateKind}`) : "";
  const prev = digits(prevRevenue);
  const nearThreshold =
    el && !isNew && el.simple && prev >= policy.simpleThreshold * 0.9;

  const moneyField = (
    label: string,
    value: string,
    set: (v: string) => void,
    opts: { hint?: string; optional?: boolean; placeholder?: string; disabled?: boolean } = {},
  ) => (
    <label className="fw-field">
      <span className="fw-field-lbl">
        {label}
        {opts.optional ? <span className="sv-opt"> · {t("it.optional")}</span> : null}
      </span>
      <span className="fw-field-input">
        <input
          type="text"
          inputMode="numeric"
          placeholder={opts.placeholder ?? "0"}
          value={value}
          disabled={opts.disabled}
          onChange={(e) => set(withCommas(e.target.value))}
        />
        <span className="fw-field-suffix">{t("it.won")}</span>
      </span>
      {lang === "ko" && digits(value) > 0 && !opts.disabled ? (
        <span className="sv-hint num">{koreanAmount(digits(value))}</span>
      ) : null}
      {opts.hint ? <span className="sv-hint">{opts.hint}</span> : null}
    </label>
  );

  const countField = (label: string, value: string, set: (v: string) => void) => (
    <label className="fw-field">
      <span className="fw-field-lbl">{label}</span>
      <span className="fw-field-input">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
        />
        {t("it.people") ? <span className="fw-field-suffix">{t("it.people")}</span> : null}
      </span>
    </label>
  );

  const rateField = (key: keyof Rates, label: string) => (
    <label className="fw-field">
      <span className="fw-field-lbl">{label}</span>
      <span className="fw-field-input">
        <input
          type="text"
          inputMode="decimal"
          value={rateText[key]}
          onChange={(e) => editRate(key, e.target.value)}
        />
        <span className="fw-field-suffix">%</span>
      </span>
    </label>
  );

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="sv-work it-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("it.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("it.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <div className="fw-field">
              <span className="fw-field-lbl">{t("it.year")}</span>
              <div className="seg sc-seg" role="group" aria-label={t("it.year")}>
                {TAX_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={year === y ? "is-active" : ""}
                    aria-pressed={year === y}
                    onClick={() => setYear(y)}
                  >
                    {y}
                    {t("it.yearSuffix")}
                  </button>
                ))}
              </div>
            </div>

            {moneyField(t("it.revenue"), revenue, setRevenue, {
              hint: t("it.revenueHint"),
              placeholder: lang === "ko" ? "예) 30,000,000" : "e.g. 30,000,000",
            })}

            {moneyField(t("it.prevRevenue"), isNew ? "" : prevRevenue, setPrevRevenue, {
              disabled: isNew,
              hint: t("it.prevHint"),
            })}
            <div className="fw-checks">
              <label className="fw-check">
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                <span>{t("it.isNew")}</span>
              </label>
            </div>

            <h3 className="it-sub">{t("it.ratesHead")}</h3>
            <label className="fw-field">
              <span className="fw-field-lbl">{t("it.industry")}</span>
              <span className="fw-field-input">
                <select
                  className="al-select"
                  value={industry}
                  onChange={(e) => pickIndustry(e.target.value)}
                >
                  {notice.rates.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} {r.name[lang]}
                    </option>
                  ))}
                  <option value="custom">{t("it.custom")}</option>
                </select>
              </span>
            </label>
            <div className="fw-row fw-row-3">
              {rateField("simple", t("it.simple"))}
              {rateField("simpleExcess", t("it.simpleExcess"))}
              {rateField("standard", t("it.standard"))}
            </div>
            <p className="sv-hint">{t("it.ratesHint")}</p>
            {estimated ? (
              <p className="ft-note">
                {t("it.ratesEstimated")
                  .replace("{year}", String(year))
                  .replace("{base}", String(notice.year))}
              </p>
            ) : null}

            <h3 className="it-sub">{t("it.peopleHead")}</h3>
            <div className="fw-row fw-row-3">
              {countField(t("it.dependents"), dependents, setDependents)}
              {countField(t("it.elderly"), elderly, setElderly)}
              {countField(t("it.disabled"), disabled, setDisabled)}
            </div>
            {moneyField(t("it.pension"), pension, setPension, { optional: true })}

            <details className="it-advanced">
              <summary>{t("it.advanced")}</summary>
              <div className="fw-form">
                {moneyField(t("it.actual"), actual, setActual, { optional: true, hint: t("it.actualHint") })}
                {moneyField(t("it.major"), major, setMajor, { optional: true, hint: t("it.majorHint") })}
                {moneyField(t("it.prepaid"), prepaid, setPrepaid, {
                  optional: true,
                  hint: t("it.prepaidHint"),
                  placeholder: result ? formatNumber(result.prepaid) : "0",
                })}
              </div>
            </details>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!result || !shown ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{t("it.empty")}</p>
            </div>
          ) : (
            <>
              <div className="sv-kpis">
                <div className="fw-emph-card primary">
                  <div className="ec-label">
                    {shown.totalPayable < 0 ? t("it.refund") : shown.totalPayable > 0 ? t("it.owe") : t("it.zero")}
                  </div>
                  <div className="ec-value num">{formatWon(Math.abs(shown.totalPayable))}</div>
                  <div className="ec-sub num">
                    {t("it.byMethod").replace("{m}", t(`it.m.${shown.kind}`))} ·{" "}
                    {t("it.subSplit")
                      .replace("{a}", signedWon(shown.payable))
                      .replace("{b}", signedWon(shown.localPayable))}
                  </div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("it.determined")}</div>
                  <div className="ec-value num">{formatWon(shown.determinedTax)}</div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("it.prepaidCard")}</div>
                  <div className="ec-value num">{formatWon(result.prepaid + result.prepaidLocal)}</div>
                </div>
              </div>

              {el?.doubleEntry ? (
                <p className="ft-note">{t("it.doubleEntry").replace("{n}", manWon(policy.doubleEntryThreshold, lang))}</p>
              ) : null}
              {el && !el.doubleEntry && el.simpleReason === "prevOver" ? (
                <p className="ft-note">{t("it.why.prevOver").replace("{n}", manWon(policy.simpleThreshold, lang))}</p>
              ) : null}
              {el && el.simpleReason === "currentOver" ? (
                <p className="ft-note">{t("it.why.currentOver").replace("{n}", manWon(policy.doubleEntryThreshold, lang))}</p>
              ) : null}
              {nearThreshold ? (
                <p className="ft-note">{t("it.near").replace("{n}", manWon(policy.simpleThreshold, lang))}</p>
              ) : null}
              {shown.penalty > 0 ? (
                <p className="ft-note">
                  {t("it.penalty")
                    .replace("{n}", manWon(policy.smallBusinessThreshold, lang))
                    .replace("{p}", formatWon(shown.penalty))}
                </p>
              ) : null}

              <div className="ft-compare">
                <h3>{t("it.compareTitle")}</h3>
                <div className="al-table-wrap">
                  <table className="al-table it-table">
                    <thead>
                      <tr>
                        <th>{t("it.col.method")}</th>
                        <th className="r it-hide-sm">{t("it.col.income")}</th>
                        <th className="r">{t("it.col.tax")}</th>
                        <th className="r">{t("it.col.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["simple", "standard", "ledger"] as MethodKind[]).map((k) => {
                        const m = byKind(k);
                        if (!m) {
                          return (
                            <tr key={k} className="is-expired">
                              <td>{t(`it.m.${k}`)}</td>
                              <td className="it-muted" colSpan={3}>{t("it.ledgerEmpty")}</td>
                            </tr>
                          );
                        }
                        const cls = [
                          m.eligible ? "" : "it-off",
                          k === shownKind ? "is-current" : "",
                        ].join(" ").trim();
                        return (
                          <tr
                            key={k}
                            className={cls}
                            onClick={() => setSelected(k)}
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(k)}
                            aria-selected={k === shownKind}
                          >
                            <td>
                              {t(`it.m.${k}`)}
                              <span className={`al-tag${k === result.best ? " it-best" : ""}`}>
                                {k === result.best ? t("it.tag.best") : m.eligible ? t("it.tag.ok") : t("it.tag.no")}
                              </span>
                            </td>
                            <td className="num r it-hide-sm">{formatNumber(m.income)}</td>
                            <td className="num r">{formatNumber(m.determinedTax)}</td>
                            <td className="num r">{signedWon(m.totalPayable)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {el?.simple ? <p>{t("it.why.simple")}</p> : null}
                {byKind("standard")?.capped ? (
                  <p>{t("it.capped").replace("{x}", String(policy.standardCapMultiplierX10 / 10))}</p>
                ) : null}
                {result.estimateKind ? (
                  <p>
                    {result.breakEvenExpenses === null
                      ? t("it.breakEvenNone").replace("{m}", estimateName)
                      : result.breakEvenExpenses === 0
                        ? t("it.breakEvenZero").replace("{m}", estimateName)
                        : t("it.breakEven")
                            .replace("{e}", formatWon(result.breakEvenExpenses))
                            .replace("{m}", estimateName)}
                  </p>
                ) : null}
              </div>

              <div className="fw-breakdown">
                <h3>
                  {t("it.detail")} · {t(`it.m.${shown.kind}`)}
                </h3>
                <div className="bd-row">
                  <span className="k">{t("it.d.revenue")}</span>
                  <span className="v num">{formatWon(result.input.revenue)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("it.d.expenses")}</span>
                  <span className="v num">− {formatWon(shown.expenses)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("it.d.income")}</span>
                  <span className="v num">{formatWon(shown.income)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("it.d.deductions")}</span>
                  <span className="v num">− {formatWon(shown.deductions)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("it.d.base")}</span>
                  <span className="v num">{formatWon(shown.taxBase)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("it.d.computed")}</span>
                  <span className="v num">{formatWon(shown.computedTax)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("it.d.credit")}</span>
                  <span className="v num">− {formatWon(shown.taxCredit)}</span>
                </div>
                {shown.penalty > 0 ? (
                  <div className="bd-row sub">
                    <span className="k">{t("it.d.penalty")}</span>
                    <span className="v num">+ {formatWon(shown.penalty)}</span>
                  </div>
                ) : null}
                <div className="bd-row">
                  <span className="k">{t("it.d.determined")}</span>
                  <span className="v num">{formatWon(shown.determinedTax)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("it.d.prepaid")}</span>
                  <span className="v num">− {formatWon(result.prepaid)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("it.d.payable")}</span>
                  <span className="v num">{signedWon(shown.payable)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("it.d.local")}</span>
                  <span className="v num">{signedWon(shown.localPayable)}</span>
                </div>
                <div className="bd-row total">
                  <span className="k">{t("it.d.total")}</span>
                  <span className="v num">{signedWon(shown.totalPayable)}</span>
                </div>
              </div>

              <div className="sc-basis">
                <h3>{t("it.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("it.basisRates")}</dt>
                    <dd>{t("it.basisRatesValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("it.basisNotice")}</dt>
                    <dd>
                      {industry === "custom" ? t("it.custom") : `${notice.year} · ${notice.notice}`}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("it.basisVerified")}</dt>
                    <dd className="num">{INCOMETAX_VERIFIED_AT}</dd>
                  </div>
                </dl>
                <p>{t("it.basisNote")}</p>
              </div>

              <p className="sc-disclaimer">{t("it.disclaimer")}</p>
            </>
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

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
