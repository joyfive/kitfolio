"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  grossFromSupply,
  supplyFromGross,
  calculateSimplified,
  VAT_MODES,
  ROUNDINGS,
  MAX_AMOUNT,
  type VatMode,
  type Rounding,
} from "../lib/vat/calculator";
import { INDUSTRIES, type IndustryId } from "../lib/vat/policy";
import { VAT_VERIFIED_AT } from "../lib/vat/sources";
import { formatNumber, formatWon } from "../lib/salary/formatter";

const SLUG = "vat-calculator";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "vt.tabLabel": "과세 유형",
    "vt.tab.general": "일반과세",
    "vt.tab.simplified": "간이과세",
    "vt.inputHead": "계산 조건",
    "vt.reset": "초기화",
    "vt.won": "원",
    "vt.quick": "빠른 입력",
    "vt.empty": "금액을 입력하면 공급가액·부가세·합계가 표시됩니다.",
    "vt.emptySimplified": "매출(공급대가)을 입력하면 납부할 부가세가 표시됩니다.",

    "vt.direction": "계산 방향",
    "vt.dir.forward": "공급가액 → 합계",
    "vt.dir.reverse": "합계 → 공급가액",
    "vt.amount.forward": "공급가액 (부가세 별도)",
    "vt.amount.reverse": "합계금액 (부가세 포함)",
    "vt.rounding": "부가세 1원 미만",
    "vt.round.floor": "절사",
    "vt.round.round": "반올림",
    "vt.round.ceil": "올림",
    "vt.hint.general":
      "세금계산서는 보통 공급가액에 10%를 곱하고 1원 미만을 버립니다. 일부 POS·카드 단말기는 반올림을 씁니다.",

    "vt.supply": "공급가액",
    "vt.vat": "부가세",
    "vt.gross": "합계금액",
    "vt.ofSupply": "공급가액의 10%",
    "vt.methodA": "합계 고정 (영수증 방식)",
    "vt.methodB": "공급가액 기준 (세금계산서 방식)",
    "vt.methodTitle": "합계에서 공급가액을 구하는 두 방식",
    "vt.methodSame": "두 방식의 결과가 같습니다.",
    "vt.methodDiff":
      "두 방식의 공급가액이 {n}원 다릅니다. 영수증은 합계를 고정하고 나누고, 세금계산서는 공급가액에서 부가세를 계산해 더하기 때문입니다.",
    "vt.noExact":
      "{rounding} 기준으로 이 합계를 정확히 만드는 공급가액은 없습니다. 만들 수 있는 가장 가까운 합계는 {below} · {above}입니다.",
    "vt.formulaTitle": "계산 과정",
    "vt.formulaForward": "부가세 = 공급가액 × 10% → 1원 미만 {rounding}",
    "vt.formulaReverse": "공급가액 = 합계 × 100 ÷ 110 → 1원 미만 반올림, 부가세 = 합계 − 공급가액",

    "vt.industry": "업종",
    "vt.ind.retail": "소매업·음식점업·재생용 재료수집 (15%)",
    "vt.ind.manufacturing": "제조업·농임어업·소화물 전문 운송 (20%)",
    "vt.ind.lodging": "숙박업 (25%)",
    "vt.ind.construction": "건설업·운수 및 창고업·정보통신업 (30%)",
    "vt.ind.professional": "금융·보험, 전문·과학·기술서비스, 사업지원·임대서비스, 부동산 관련 서비스 (40%)",
    "vt.ind.rental": "부동산임대업 (40%)",
    "vt.ind.otherService": "그 밖의 서비스업 (30%)",
    "vt.sales": "매출 (공급대가 · 부가세 포함)",
    "vt.salesHint": "1년(1월~12월) 매출 합계입니다. 7월 예정부과 기간이면 1~6월 매출을 넣고 개월 수를 6으로 고르세요.",
    "vt.purchases": "세금계산서·카드 영수증을 받은 매입",
    "vt.cardSales": "카드·현금영수증 매출",
    "vt.optional": "선택",
    "vt.months": "영업한 개월 수",
    "vt.monthsValue": "{n}개월",
    "vt.monthsHint": "올해 새로 개업했거나 휴업·폐업했다면 실제 영업한 개월 수를 고르세요. 1개월 미만은 1개월로 셉니다.",

    "vt.due": "납부할 부가세",
    "vt.dueExempt": "납부 면제",
    "vt.payable": "납부세액 (공제 전)",
    "vt.credits": "공제 합계",
    "vt.rate": "매출의 {pct}",
    "vt.exemptNote":
      "연 매출(공급대가)이 {limit} 미만이라 납부 의무가 면제됩니다. 면제는 납부만 해당하고 신고는 해야 합니다. 면제가 아니라면 낼 세액은 {amount}입니다.",
    "vt.annualized": "{months}개월 매출을 12개월로 환산하면 {amount}입니다. 납부 면제와 간이과세 기준은 이 금액으로 판단합니다.",
    "vt.overNote":
      "연 매출이 간이과세 기준 {limit} 이상입니다. 이 매출이 직전 연도 매출이 되는 다음 해 7월 1일부터 일반과세자로 전환됩니다.",
    "vt.excludedNote":
      "이 업종은 간이과세가 배제될 수 있습니다(부가가치세법 시행령 제109조 제2항). 최종소비자를 대상으로 하는 일부 업종은 예외입니다.",
    "vt.lostNote":
      "공제 합계가 납부세액보다 {amount} 많지만, 간이과세자는 남는 공제를 돌려받지 않습니다(환급 없음).",
    "vt.cardCapNote": "카드 발행세액공제가 연간 한도 {cap}에 걸렸습니다.",
    "vt.detail": "상세 내역",
    "vt.d.sales": "매출 (공급대가)",
    "vt.d.payable": "납부세액 = 매출 × {pct}% × 10%",
    "vt.d.purchaseCredit": "매입공제 (매입 × 0.5%)",
    "vt.d.cardCredit": "카드 발행세액공제 ({rate}%)",
    "vt.d.net": "공제 후 납부세액 (10원 미만 버림)",
    "vt.d.exempt": "납부 면제",
    "vt.compareTitle": "같은 매출·매입을 일반과세자로 계산하면",
    "vt.compareSimplified": "간이과세 (공제 후)",
    "vt.compareGeneral": "일반과세 (매출세액 − 매입세액)",
    "vt.compareRefund": "{amount} 환급",
    "vt.compareNote":
      "과세 유형은 고르는 것이 아니라 직전 연도 매출과 업종으로 정해집니다. 일반과세 값은 카드 발행세액공제 등 다른 공제 전 금액입니다.",

    "vt.basisTitle": "계산 기준",
    "vt.basisRate": "세율",
    "vt.basisRateValue": "10% (부가가치세법 제30조)",
    "vt.basisSimplified": "간이 납부세액",
    "vt.basisSimplifiedValue": "공급대가 × 업종별 부가가치율 × 10%",
    "vt.basisThreshold": "간이과세 기준",
    "vt.basisThresholdValue": "직전 연도 공급대가 1억 400만 원 미만",
    "vt.basisExempt": "납부 면제",
    "vt.basisExemptValue": "해당 연도 공급대가 4,800만 원 미만",
    "vt.basisVerified": "최근 검증",
    "vt.disclaimer":
      "참고용 계산기입니다. 일반과세자의 분기 신고 세액, 의제매입세액공제·전자세금계산서 발급세액공제 등 다른 공제, 겸업 업종 안분, 영세율·면세 거래는 반영하지 않습니다.",
  },
  en: {
    "vt.tabLabel": "Taxpayer type",
    "vt.tab.general": "General taxpayer",
    "vt.tab.simplified": "Simplified taxpayer",
    "vt.inputHead": "Inputs",
    "vt.reset": "Reset",
    "vt.won": "KRW",
    "vt.quick": "Quick amounts",
    "vt.empty": "Enter an amount to see the supply value, VAT and total.",
    "vt.emptySimplified": "Enter your sales (VAT included) to see the VAT you owe.",

    "vt.direction": "Direction",
    "vt.dir.forward": "Supply value → total",
    "vt.dir.reverse": "Total → supply value",
    "vt.amount.forward": "Supply value (VAT excluded)",
    "vt.amount.reverse": "Total (VAT included)",
    "vt.rounding": "VAT under 1 won",
    "vt.round.floor": "Round down",
    "vt.round.round": "Round",
    "vt.round.ceil": "Round up",
    "vt.hint.general":
      "Tax invoices usually take 10% of the supply value and drop anything under 1 won. Some POS and card terminals round instead.",

    "vt.supply": "Supply value",
    "vt.vat": "VAT",
    "vt.gross": "Total",
    "vt.ofSupply": "10% of supply value",
    "vt.methodA": "Total fixed (receipt method)",
    "vt.methodB": "Supply value first (tax invoice method)",
    "vt.methodTitle": "Two ways to get the supply value from a total",
    "vt.methodSame": "Both methods give the same result.",
    "vt.methodDiff":
      "The supply values differ by {n} won. A receipt fixes the total and divides it, while a tax invoice computes VAT from the supply value and adds it.",
    "vt.noExact":
      "With {rounding}, no supply value produces this exact total. The nearest totals you can make are {below} and {above}.",
    "vt.formulaTitle": "How this was calculated",
    "vt.formulaForward": "VAT = supply value × 10% → {rounding} under 1 won",
    "vt.formulaReverse": "Supply value = total × 100 ÷ 110 → rounded to 1 won, VAT = total − supply value",

    "vt.industry": "Business type",
    "vt.ind.retail": "Retail, restaurants, recyclable collection (15%)",
    "vt.ind.manufacturing": "Manufacturing, farming/forestry/fishing, parcel delivery (20%)",
    "vt.ind.lodging": "Lodging (25%)",
    "vt.ind.construction": "Construction, transport and storage, information and communications (30%)",
    "vt.ind.professional": "Finance/insurance, professional/scientific/technical, business support and rental services, real estate services (40%)",
    "vt.ind.rental": "Real estate leasing (40%)",
    "vt.ind.otherService": "Other services (30%)",
    "vt.sales": "Sales (VAT included)",
    "vt.salesHint": "Total sales for the year (January to December). For the July interim period, enter January to June sales and choose 6 months.",
    "vt.purchases": "Purchases with tax invoices or card receipts",
    "vt.cardSales": "Card and cash receipt sales",
    "vt.optional": "optional",
    "vt.months": "Months in business",
    "vt.monthsValue": "{n} months",
    "vt.monthsHint": "If you opened, suspended or closed this year, choose the months you actually operated. A partial month counts as one.",

    "vt.due": "VAT to pay",
    "vt.dueExempt": "Exempt from payment",
    "vt.payable": "Tax before credits",
    "vt.credits": "Total credits",
    "vt.rate": "{pct} of sales",
    "vt.exemptNote":
      "Annual sales (VAT included) are under {limit}, so you are exempt from paying. The exemption covers payment only: you still have to file. Without it you would owe {amount}.",
    "vt.annualized": "{months} months of sales scaled to 12 months is {amount}. The exemption and the simplified threshold are judged on this figure.",
    "vt.overNote":
      "Annual sales are at or above the simplified threshold of {limit}. Once this becomes the previous year's sales, you switch to a general taxpayer from July 1 of the following year.",
    "vt.excludedNote":
      "This business type may be barred from simplified taxation (VAT Act Enforcement Decree, Art. 109(2)). Some businesses serving final consumers are exceptions.",
    "vt.lostNote":
      "Credits exceed the tax by {amount}, but simplified taxpayers do not get the excess back (no refund).",
    "vt.cardCapNote": "The card credit hit its annual cap of {cap}.",
    "vt.detail": "Breakdown",
    "vt.d.sales": "Sales (VAT included)",
    "vt.d.payable": "Tax = sales × {pct}% × 10%",
    "vt.d.purchaseCredit": "Purchase credit (purchases × 0.5%)",
    "vt.d.cardCredit": "Card issuance credit ({rate}%)",
    "vt.d.net": "Tax after credits (under 10 won dropped)",
    "vt.d.exempt": "Exempt from payment",
    "vt.compareTitle": "The same sales and purchases as a general taxpayer",
    "vt.compareSimplified": "Simplified (after credits)",
    "vt.compareGeneral": "General (output VAT − input VAT)",
    "vt.compareRefund": "{amount} refund",
    "vt.compareNote":
      "You do not choose your taxpayer type: previous-year sales and business type decide it. The general figure is before other credits such as the card credit.",

    "vt.basisTitle": "Calculation basis",
    "vt.basisRate": "Rate",
    "vt.basisRateValue": "10% (VAT Act, Art. 30)",
    "vt.basisSimplified": "Simplified tax",
    "vt.basisSimplifiedValue": "Sales × value-added ratio × 10%",
    "vt.basisThreshold": "Simplified threshold",
    "vt.basisThresholdValue": "Previous-year sales under 104 million won",
    "vt.basisExempt": "Payment exemption",
    "vt.basisExemptValue": "Sales for the year under 48 million won",
    "vt.basisVerified": "Last verified",
    "vt.disclaimer":
      "A reference calculator for Korean VAT. It does not cover a general taxpayer's quarterly return, other credits such as the deemed input credit or e-invoice credit, apportionment across several business types, or zero-rated and exempt supplies.",
  },
};

type Direction = "forward" | "reverse";

const QUICK = [100_000, 500_000, 1_000_000, 10_000_000];
const DEFAULT_AMOUNT = "1,000,000";
const DEFAULT_SALES = "60,000,000";
const DEFAULT_PURCHASES = "22,000,000";

/** 숫자 문자열에서 숫자만 추출 */
function digits(s: string): number {
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? Math.min(n, MAX_AMOUNT) : 0;
}

/** 입력 중 천 단위 콤마 표시 (빈 값은 그대로) */
function withCommas(s: string): string {
  const clean = s.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
  return clean === "" ? "" : Math.min(Number(clean), MAX_AMOUNT).toLocaleString("en-US");
}

/** 한글 금액 보조 표기: 3,102,370 → "310만 2,370원" */
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

function pct(rate: number): string {
  return `${(rate * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

/** 로컬 기준 오늘 (YYYY-MM-DD) */
function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  showKorean,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffix: string;
  showKorean: boolean;
}) {
  const n = digits(value);
  return (
    <label className="fw-field">
      <span className="fw-field-lbl">{label}</span>
      <span className="fw-field-input">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(withCommas(e.target.value))}
        />
        <span className="fw-field-suffix">{suffix}</span>
      </span>
      {showKorean && n > 0 ? <span className="sv-hint num">{koreanAmount(n)}</span> : null}
    </label>
  );
}

export default function VatCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);
  const pathname = usePathname();

  const [mode, setMode] = useState<VatMode>("general");
  const [direction, setDirection] = useState<Direction>("forward");
  const [rounding, setRounding] = useState<Rounding>("floor");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  const [industry, setIndustry] = useState<IndustryId>("construction");
  const [sales, setSales] = useState(DEFAULT_SALES);
  const [purchases, setPurchases] = useState(DEFAULT_PURCHASES);
  const [cardSales, setCardSales] = useState("");
  const [months, setMonths] = useState(12);
  const [asOf, setAsOf] = useState("");

  // 쿼리스트링(?mode=)에서 초기 탭을 읽는다. canonical은 항상 쿼리 없는 base URL이라
  // 서버 렌더링에는 영향이 없고, 클라이언트에서만 마운트 후 한 번 반영한다.
  // 정책 기준일도 hydration 불일치를 피하려고 마운트 후에 정한다.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q && (VAT_MODES as string[]).includes(q)) setMode(q as VatMode);
    setAsOf(today());
  }, []);

  function switchMode(m: VatMode) {
    if (m === mode) return;
    setMode(m);
    window.history.replaceState(null, "", `${pathname}?mode=${m}`);
  }

  function reset() {
    if (mode === "general") {
      setDirection("forward");
      setRounding("floor");
      setAmount(DEFAULT_AMOUNT);
    } else {
      setIndustry("construction");
      setSales(DEFAULT_SALES);
      setPurchases(DEFAULT_PURCHASES);
      setCardSales("");
      setMonths(12);
    }
  }

  const value = digits(amount);
  const general = useMemo(() => {
    if (value <= 0) return null;
    if (direction === "forward") return { forward: grossFromSupply(value, rounding), reverse: null };
    return { forward: null, reverse: supplyFromGross(value, rounding) };
  }, [value, direction, rounding]);

  const salesValue = digits(sales);
  const simplified = useMemo(() => {
    if (salesValue <= 0 || !asOf) return null;
    return calculateSimplified({
      industry,
      sales: salesValue,
      purchases: digits(purchases),
      cardSales: digits(cardSales),
      months,
      asOf,
    });
  }, [industry, salesValue, purchases, cardSales, months, asOf]);

  const roundingLabel = t(`vt.round.${rounding}`);
  const placeholder = lang === "ko" ? "예) 1,000,000" : "e.g. 1,000,000";

  return (
    <>
      <div className="uc-tabs">
        <div className="uc-tabs-inner">
          <span className="uc-tabs-label">{t("vt.tabLabel")}</span>
          {VAT_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`uc-tab${m === mode ? " is-active" : ""}`}
              aria-current={m === mode ? "true" : undefined}
            >
              {t(`vt.tab.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <PageHead slug={SLUG} />

      <div className="sv-work vt-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("vt.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("vt.reset")}</span>
            </button>
          </div>

          {mode === "general" ? (
            <div className="fw-form">
              <div className="fw-field">
                <span className="fw-field-lbl">{t("vt.direction")}</span>
                <div className="seg sc-seg" role="group" aria-label={t("vt.direction")}>
                  {(["forward", "reverse"] as Direction[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={direction === d ? "is-active" : ""}
                      aria-pressed={direction === d}
                      onClick={() => setDirection(d)}
                    >
                      {t(`vt.dir.${d}`)}
                    </button>
                  ))}
                </div>
              </div>

              <MoneyInput
                label={t(`vt.amount.${direction}`)}
                value={amount}
                onChange={setAmount}
                placeholder={placeholder}
                suffix={t("vt.won")}
                showKorean={lang === "ko"}
              />

              <div className="fw-field">
                <span className="fw-field-lbl">{t("vt.quick")}</span>
                <div className="ft-quick">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`ft-chip num${value === q ? " is-active" : ""}`}
                      onClick={() => setAmount(q.toLocaleString("en-US"))}
                    >
                      {lang === "ko" ? `${q / 10_000}만` : formatNumber(q)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fw-field">
                <span className="fw-field-lbl">{t("vt.rounding")}</span>
                <div className="seg sc-seg" role="group" aria-label={t("vt.rounding")}>
                  {ROUNDINGS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={rounding === r ? "is-active" : ""}
                      aria-pressed={rounding === r}
                      onClick={() => setRounding(r)}
                    >
                      {t(`vt.round.${r}`)}
                    </button>
                  ))}
                </div>
              </div>

              <p className="sv-hint">{t("vt.hint.general")}</p>
            </div>
          ) : (
            <div className="fw-form">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("vt.industry")}</span>
                <span className="fw-field-input">
                  <select
                    className="al-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryId)}
                  >
                    {INDUSTRIES.map((x) => (
                      <option key={x.id} value={x.id}>
                        {t(`vt.ind.${x.id}`)}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <MoneyInput
                label={t("vt.sales")}
                value={sales}
                onChange={setSales}
                placeholder={lang === "ko" ? "예) 60,000,000" : "e.g. 60,000,000"}
                suffix={t("vt.won")}
                showKorean={lang === "ko"}
              />
              <p className="sv-hint">{t("vt.salesHint")}</p>

              <MoneyInput
                label={t("vt.purchases")}
                value={purchases}
                onChange={setPurchases}
                placeholder="0"
                suffix={t("vt.won")}
                showKorean={lang === "ko"}
              />

              <MoneyInput
                label={
                  <>
                    {t("vt.cardSales")}
                    <span className="sv-opt"> · {t("vt.optional")}</span>
                  </>
                }
                value={cardSales}
                onChange={setCardSales}
                placeholder="0"
                suffix={t("vt.won")}
                showKorean={lang === "ko"}
              />

              <label className="fw-field">
                <span className="fw-field-lbl">{t("vt.months")}</span>
                <span className="fw-field-input">
                  <select
                    className="al-select"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => 12 - i).map((n) => (
                      <option key={n} value={n}>
                        {t("vt.monthsValue").replace("{n}", String(n))}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <p className="sv-hint">{t("vt.monthsHint")}</p>
            </div>
          )}
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {mode === "general" ? (
            !general ? (
              <div className="sc-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18M7 15h4" />
                </svg>
                <p>{t("vt.empty")}</p>
              </div>
            ) : general.forward ? (
              <>
                <div className="sv-kpis">
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("vt.gross")}</div>
                    <div className="ec-value num">{formatWon(general.forward.gross)}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("vt.supply")}</div>
                    <div className="ec-value num">{formatWon(general.forward.supply)}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("vt.vat")}</div>
                    <div className="ec-value num">{formatWon(general.forward.vat)}</div>
                    <div className="ec-sub">{t("vt.ofSupply")}</div>
                  </div>
                </div>

                <div className="sv-formula">
                  <h3>{t("vt.formulaTitle")}</h3>
                  <p className="sv-formula-rule num">
                    {t("vt.formulaForward").replace("{rounding}", roundingLabel)}
                  </p>
                  <p className="sv-formula-calc num">
                    {formatNumber(general.forward.supply)} × 10% ={" "}
                    {(general.forward.supply / 10).toLocaleString("en-US", { maximumFractionDigits: 1 })} →{" "}
                    {formatWon(general.forward.vat)}
                  </p>
                  <p className="sv-formula-calc is-final num">
                    {formatNumber(general.forward.supply)} + {formatNumber(general.forward.vat)} ={" "}
                    {formatWon(general.forward.gross)}
                  </p>
                </div>
              </>
            ) : general.reverse ? (
              <>
                <div className="sv-kpis">
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("vt.supply")}</div>
                    <div className="ec-value num">{formatWon(general.reverse.inclusive.supply)}</div>
                    <div className="ec-sub">{t("vt.methodA")}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("vt.vat")}</div>
                    <div className="ec-value num">{formatWon(general.reverse.inclusive.vat)}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("vt.gross")}</div>
                    <div className="ec-value num">{formatWon(general.reverse.gross)}</div>
                  </div>
                </div>

                <div className="ft-compare">
                  <h3>{t("vt.methodTitle")}</h3>
                  <div className="ft-compare-row">
                    <div className="ft-compare-cell is-current">
                      <span className="k">{t("vt.methodA")}</span>
                      <span className="v num">{formatWon(general.reverse.inclusive.supply)}</span>
                      <span className="k num">
                        {t("vt.vat")} {formatWon(general.reverse.inclusive.vat)}
                      </span>
                    </div>
                    <div className="ft-compare-cell">
                      <span className="k">{t("vt.methodB")}</span>
                      <span className="v num">
                        {general.reverse.exact ? formatWon(general.reverse.exact.supply) : "-"}
                      </span>
                      {general.reverse.exact ? (
                        <span className="k num">
                          {t("vt.vat")} {formatWon(general.reverse.exact.vat)} ({roundingLabel})
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p>
                    {general.reverse.exact
                      ? general.reverse.exact.supply === general.reverse.inclusive.supply
                        ? t("vt.methodSame")
                        : t("vt.methodDiff").replace(
                            "{n}",
                            formatNumber(
                              Math.abs(general.reverse.exact.supply - general.reverse.inclusive.supply),
                            ),
                          )
                      : t("vt.noExact")
                          .replace("{rounding}", roundingLabel)
                          .replace("{below}", formatWon(general.reverse.nearestBelow?.gross ?? 0))
                          .replace("{above}", formatWon(general.reverse.nearestAbove?.gross ?? 0))}
                  </p>
                </div>

                <div className="sv-formula">
                  <h3>{t("vt.formulaTitle")}</h3>
                  <p className="sv-formula-rule num">{t("vt.formulaReverse")}</p>
                  <p className="sv-formula-calc num">
                    {formatNumber(general.reverse.gross)} × 100 ÷ 110 ={" "}
                    {((general.reverse.gross * 100) / 110).toLocaleString("en-US", { maximumFractionDigits: 2 })} →{" "}
                    {formatWon(general.reverse.inclusive.supply)}
                  </p>
                  <p className="sv-formula-calc is-final num">
                    {formatNumber(general.reverse.gross)} − {formatNumber(general.reverse.inclusive.supply)} ={" "}
                    {formatWon(general.reverse.inclusive.vat)}
                  </p>
                </div>
              </>
            ) : null
          ) : !simplified ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{t("vt.emptySimplified")}</p>
            </div>
          ) : (
            <>
              <div className="sv-kpis">
                <div className="fw-emph-card primary">
                  <div className="ec-label">{t("vt.due")}</div>
                  <div className="ec-value num">
                    {simplified.exempt ? t("vt.dueExempt") : formatWon(simplified.due)}
                  </div>
                  {!simplified.exempt ? (
                    <div className="ec-sub num">
                      {t("vt.rate").replace("{pct}", pct(simplified.due / salesValue))}
                    </div>
                  ) : null}
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("vt.payable")}</div>
                  <div className="ec-value num">{formatWon(simplified.payable)}</div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("vt.credits")}</div>
                  <div className="ec-value num">{formatWon(simplified.creditsApplied)}</div>
                </div>
              </div>

              {simplified.exempt ? (
                <p className="ft-note">
                  {t("vt.exemptNote")
                    .replace("{limit}", formatWon(simplified.exemptionThreshold))
                    .replace("{amount}", formatWon(simplified.netBeforeExemption))}
                </p>
              ) : null}
              {months < 12 ? (
                <p className="ft-note">
                  {t("vt.annualized")
                    .replace("{months}", String(months))
                    .replace("{amount}", formatWon(simplified.annualizedSales))}
                </p>
              ) : null}
              {simplified.overThreshold ? (
                <p className="ft-note">
                  {t("vt.overNote").replace("{limit}", formatWon(simplified.simplifiedThreshold))}
                </p>
              ) : null}
              {simplified.mayBeExcluded ? <p className="ft-note">{t("vt.excludedNote")}</p> : null}
              {simplified.creditsLost > 0 ? (
                <p className="ft-note">
                  {t("vt.lostNote").replace("{amount}", formatWon(simplified.creditsLost))}
                </p>
              ) : null}
              {simplified.cardCapped ? (
                <p className="ft-note">
                  {t("vt.cardCapNote").replace("{cap}", formatWon(simplified.cardAnnualCap))}
                </p>
              ) : null}

              <div className="fw-breakdown">
                <h3>{t("vt.detail")}</h3>
                <div className="bd-row">
                  <span className="k">{t("vt.d.sales")}</span>
                  <span className="v num">{formatWon(salesValue)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">
                    {t("vt.d.payable").replace("{pct}", String(simplified.valueAddedPct))}
                  </span>
                  <span className="v num">{formatWon(simplified.payable)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("vt.d.purchaseCredit")}</span>
                  <span className="v num">− {formatWon(simplified.purchaseCredit)}</span>
                </div>
                {simplified.cardCredit > 0 ? (
                  <div className="bd-row sub">
                    <span className="k">
                      {t("vt.d.cardCredit").replace("{rate}", String(simplified.cardPermille / 10))}
                    </span>
                    <span className="v num">− {formatWon(simplified.cardCredit)}</span>
                  </div>
                ) : null}
                <div className="bd-row">
                  <span className="k">{t("vt.d.net")}</span>
                  <span className="v num">{formatWon(simplified.netBeforeExemption)}</span>
                </div>
                <div className="bd-row total">
                  <span className="k">{simplified.exempt ? t("vt.d.exempt") : t("vt.due")}</span>
                  <span className="v num">{formatWon(simplified.due)}</span>
                </div>
              </div>

              <div className="ft-compare">
                <h3>{t("vt.compareTitle")}</h3>
                <div className="ft-compare-row">
                  <div className="ft-compare-cell is-current">
                    <span className="k">{t("vt.compareSimplified")}</span>
                    <span className="v num">{formatWon(simplified.due)}</span>
                  </div>
                  <div className="ft-compare-cell">
                    <span className="k">{t("vt.compareGeneral")}</span>
                    <span className="v num">
                      {simplified.generalComparison >= 0
                        ? formatWon(simplified.generalComparison)
                        : t("vt.compareRefund").replace("{amount}", formatWon(-simplified.generalComparison))}
                    </span>
                  </div>
                </div>
                <p>{t("vt.compareNote")}</p>
              </div>
            </>
          )}

          {(mode === "general" ? general : simplified) ? (
            <>
              <div className="sc-basis">
                <h3>{t("vt.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("vt.basisRate")}</dt>
                    <dd>{t("vt.basisRateValue")}</dd>
                  </div>
                  {mode === "simplified" ? (
                    <>
                      <div>
                        <dt>{t("vt.basisSimplified")}</dt>
                        <dd>{t("vt.basisSimplifiedValue")}</dd>
                      </div>
                      <div>
                        <dt>{t("vt.basisThreshold")}</dt>
                        <dd>{t("vt.basisThresholdValue")}</dd>
                      </div>
                      <div>
                        <dt>{t("vt.basisExempt")}</dt>
                        <dd>{t("vt.basisExemptValue")}</dd>
                      </div>
                    </>
                  ) : null}
                  <div>
                    <dt>{t("vt.basisVerified")}</dt>
                    <dd className="num">{VAT_VERIFIED_AT}</dd>
                  </div>
                </dl>
              </div>

              <p className="sc-disclaimer">{t("vt.disclaimer")}</p>
            </>
          ) : null}

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
