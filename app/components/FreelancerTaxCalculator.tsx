"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  calculateWithholding,
  reverseWithholding,
  INCOME_MODES,
  MAX_AMOUNT,
  type IncomeMode,
} from "../lib/freelancer/calculator";
import { WITHHOLDING_POLICY } from "../lib/freelancer/policy";
import { FREELANCER_VERIFIED_AT } from "../lib/freelancer/sources";
import { formatNumber, formatWon } from "../lib/salary/formatter";

const SLUG = "freelancer-tax-calculator";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "ft.tabLabel": "소득 구분",
    "ft.tab.business": "사업소득 3.3%",
    "ft.tab.other": "기타소득 8.8%",
    "ft.inputHead": "계산 조건",
    "ft.reset": "초기화",
    "ft.direction": "계산 방향",
    "ft.dir.forward": "지급액 → 실수령액",
    "ft.dir.reverse": "실수령액 → 지급액",
    "ft.amount.forward": "지급액 (세전)",
    "ft.amount.reverse": "받고 싶은 실수령액",
    "ft.won": "원",
    "ft.quick": "빠른 입력",
    "ft.hint.business":
      "외주·용역처럼 계속적·반복적으로 하는 일의 대가입니다. 지급액의 3%가 소득세, 그 10%가 지방소득세로 원천징수됩니다.",
    "ft.hint.other":
      "일시적인 강연료·원고료처럼 필요경비 60%를 인정받는 기타소득입니다. 한 건씩 입력하세요.",
    "ft.empty": "금액을 입력하면 원천징수 세액과 실수령액이 표시됩니다.",
    "ft.net": "실수령액",
    "ft.grossNeeded": "필요한 최소 지급액",
    "ft.netAt": "이 지급액의 실수령액",
    "ft.exact": "목표 실수령액과 정확히 같습니다.",
    "ft.over": "10원 단위 절사 때문에 정확히 맞는 지급액이 없어, 목표보다 {n}원 많은 실수령액이 되는 가장 작은 금액입니다.",
    "ft.simpleDiv": "단순 나눗셈({rate})으로 계산하면 {gross}입니다.",
    "ft.totalTax": "원천징수 합계",
    "ft.ofGross": "지급액의 {pct}",
    "ft.incomeTax": "소득세",
    "ft.localTax": "지방소득세",
    "ft.detail": "상세 내역",
    "ft.gross": "지급액",
    "ft.expense": "필요경비 (60%)",
    "ft.taxable": "기타소득금액",
    "ft.minimum":
      "기타소득금액이 건별 5만 원 이하라 과세최저한에 해당해 원천징수가 없습니다 (지급액 125,000원 이하).",
    "ft.smallBusiness":
      "계속적·반복적 인적용역의 사업소득은 소득세가 1,000원 미만이어도 원천징수합니다. 이 예외에 해당하지 않는 사업소득이면 징수하지 않을 수 있습니다.",
    "ft.smallOther": "소득세가 1,000원 미만이라 소액 부징수로 원천징수하지 않습니다.",
    "ft.formulaTitle": "계산 과정",
    "ft.formulaBizTax": "소득세 = 지급액 × 3% → 10원 미만 버림",
    "ft.formulaOtherTax": "소득세 = (지급액 × 40%) × 20% → 10원 미만 버림",
    "ft.formulaLocal": "지방소득세 = 소득세 × 10% → 10원 미만 버림",
    "ft.compareTitle": "같은 지급액을 다른 소득으로 받으면",
    "ft.compareBusiness": "사업소득 3.3%",
    "ft.compareOther": "기타소득 8.8%",
    "ft.compareNote": "어느 쪽으로 처리할지는 고르는 것이 아니라 소득의 성격(계속·반복 여부)으로 정해집니다.",
    "ft.basisTitle": "계산 기준",
    "ft.basisRate": "원천징수세율",
    "ft.basisRateBiz": "소득세 3% + 지방소득세 0.3%",
    "ft.basisRateOther": "기타소득금액의 20% + 지방소득세 2%",
    "ft.basisRound": "끝수 처리",
    "ft.basisRoundValue": "세액별 10원 미만 버림",
    "ft.basisVerified": "최근 검증",
    "ft.basisNote":
      "원천징수는 미리 내는 세금입니다. 다음 해 5월 종합소득세 신고에서 연간 수입·경비·다른 소득을 반영해 환급받거나 추가로 낼 수 있습니다.",
    "ft.disclaimer":
      "이 계산기는 지급 시점의 원천징수액을 계산하는 참고용 도구입니다. 사업자등록한 일반과세자의 세금계산서 거래, 고용보험 등 다른 공제, 종합소득세 정산 결과는 반영하지 않습니다.",
  },
  en: {
    "ft.tabLabel": "Income type",
    "ft.tab.business": "Business income 3.3%",
    "ft.tab.other": "Other income 8.8%",
    "ft.inputHead": "Inputs",
    "ft.reset": "Reset",
    "ft.direction": "Direction",
    "ft.dir.forward": "Fee → net pay",
    "ft.dir.reverse": "Net pay → fee",
    "ft.amount.forward": "Fee (before tax)",
    "ft.amount.reverse": "Net pay you want",
    "ft.won": "KRW",
    "ft.quick": "Quick amounts",
    "ft.hint.business":
      "Pay for ongoing, repeated work such as contract projects. 3% of the fee is withheld as income tax and 10% of that as local income tax.",
    "ft.hint.other":
      "Other income with a 60% deemed expense, such as a one-off lecture or manuscript fee. Enter one payment at a time.",
    "ft.empty": "Enter an amount to see the tax withheld and your net pay.",
    "ft.net": "Net pay",
    "ft.grossNeeded": "Smallest fee needed",
    "ft.netAt": "Net pay at this fee",
    "ft.exact": "Exactly matches your target net pay.",
    "ft.over": "Because of the 10 won rounding no fee hits the target exactly, so this is the smallest fee that leaves {n} won more than the target.",
    "ft.simpleDiv": "Simple division ({rate}) would give {gross}.",
    "ft.totalTax": "Total withheld",
    "ft.ofGross": "{pct} of the fee",
    "ft.incomeTax": "Income tax",
    "ft.localTax": "Local income tax",
    "ft.detail": "Breakdown",
    "ft.gross": "Fee",
    "ft.expense": "Deemed expense (60%)",
    "ft.taxable": "Taxable other income",
    "ft.minimum":
      "Taxable other income is 50,000 won or less for this payment, so nothing is withheld (fees up to 125,000 won).",
    "ft.smallBusiness":
      "Business income from personal services supplied on an ongoing, repeated basis is withheld even when the income tax is under 1,000 won. Other business income may be exempt.",
    "ft.smallOther": "The income tax is under 1,000 won, so nothing is withheld.",
    "ft.formulaTitle": "How this was calculated",
    "ft.formulaBizTax": "Income tax = fee × 3% → drop under 10 won",
    "ft.formulaOtherTax": "Income tax = (fee × 40%) × 20% → drop under 10 won",
    "ft.formulaLocal": "Local income tax = income tax × 10% → drop under 10 won",
    "ft.compareTitle": "The same fee as the other income type",
    "ft.compareBusiness": "Business income 3.3%",
    "ft.compareOther": "Other income 8.8%",
    "ft.compareNote": "You do not choose the type: the nature of the income (ongoing and repeated or not) decides it.",
    "ft.basisTitle": "Calculation basis",
    "ft.basisRate": "Withholding rate",
    "ft.basisRateBiz": "3% income tax + 0.3% local income tax",
    "ft.basisRateOther": "20% of taxable other income + 2% local income tax",
    "ft.basisRound": "Rounding",
    "ft.basisRoundValue": "Each tax drops anything under 10 won",
    "ft.basisVerified": "Last verified",
    "ft.basisNote":
      "Withholding is a prepayment. On the following May's global income tax return, annual revenue, expenses and other income are taken into account and you may be refunded or owe more.",
    "ft.disclaimer":
      "This is a reference tool for the tax withheld at the time of payment in Korea. Tax-invoice deals by VAT-registered businesses, other deductions such as employment insurance, and the annual income tax settlement are not included.",
  },
};

type Direction = "forward" | "reverse";

const QUICK = [500_000, 1_000_000, 3_000_000, 5_000_000];
const DEFAULT_AMOUNT = "1,000,000";

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

export default function FreelancerTaxCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);
  const pathname = usePathname();

  const [mode, setMode] = useState<IncomeMode>("business");
  const [direction, setDirection] = useState<Direction>("forward");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  // 쿼리스트링(?mode=)에서 초기 탭을 읽는다. canonical은 항상 쿼리 없는 base URL이라
  // 서버 렌더링에는 영향이 없고, 클라이언트에서만 마운트 후 한 번 반영한다.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q && (INCOME_MODES as string[]).includes(q)) setMode(q as IncomeMode);
  }, []);

  function switchMode(m: IncomeMode) {
    if (m === mode) return;
    setMode(m);
    window.history.replaceState(null, "", `${pathname}?mode=${m}`);
  }

  function reset() {
    setDirection("forward");
    setAmount(DEFAULT_AMOUNT);
  }

  const value = digits(amount);

  const calc = useMemo(() => {
    if (value <= 0) return null;
    if (direction === "forward") {
      return { result: calculateWithholding(value, mode), reverse: null };
    }
    const reverse = reverseWithholding(value, mode);
    return { result: reverse.result, reverse };
  }, [value, mode, direction]);

  const result = calc?.result ?? null;
  const reverse = calc?.reverse ?? null;
  const other: IncomeMode = mode === "business" ? "other" : "business";
  const compare = result ? calculateWithholding(result.gross, other) : null;

  const keepRate = mode === "business" ? "0.967" : "0.912";
  const simpleGross = reverse ? Math.ceil(reverse.target / Number(keepRate)) : 0;

  const smallAmountNote =
    result && result.incomeTax > 0 && mode === "business" &&
    result.incomeTax < WITHHOLDING_POLICY.smallAmountThreshold;

  return (
    <>
      <div className="uc-tabs">
        <div className="uc-tabs-inner">
          <span className="uc-tabs-label">{t("ft.tabLabel")}</span>
          {INCOME_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`uc-tab${m === mode ? " is-active" : ""}`}
              aria-current={m === mode ? "true" : undefined}
            >
              {t(`ft.tab.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <PageHead slug={SLUG} />

      <div className="sv-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("ft.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("ft.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <div className="fw-field">
              <span className="fw-field-lbl">{t("ft.direction")}</span>
              <div className="seg sc-seg" role="group" aria-label={t("ft.direction")}>
                {(["forward", "reverse"] as Direction[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={direction === d ? "is-active" : ""}
                    aria-pressed={direction === d}
                    onClick={() => setDirection(d)}
                  >
                    {t(`ft.dir.${d}`)}
                  </button>
                ))}
              </div>
            </div>

            <label className="fw-field">
              <span className="fw-field-lbl">{t(`ft.amount.${direction}`)}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={lang === "ko" ? "예) 3,000,000" : "e.g. 3,000,000"}
                  value={amount}
                  onChange={(e) => setAmount(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("ft.won")}</span>
              </span>
              {lang === "ko" && value > 0 ? (
                <span className="sv-hint num">{koreanAmount(value)}</span>
              ) : null}
            </label>

            <div className="fw-field">
              <span className="fw-field-lbl">{t("ft.quick")}</span>
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

            <p className="sv-hint">{t(`ft.hint.${mode}`)}</p>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!result ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{t("ft.empty")}</p>
            </div>
          ) : (
            <>
              <div className="sv-kpis">
                {reverse ? (
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("ft.grossNeeded")}</div>
                    <div className="ec-value num">{formatWon(result.gross)}</div>
                    <div className="ec-sub">
                      {reverse.exact
                        ? t("ft.exact")
                        : t("ft.over").replace("{n}", formatNumber(result.net - reverse.target))}{" "}
                      {result.totalTax > 0 && simpleGross !== result.gross
                        ? t("ft.simpleDiv")
                            .replace("{rate}", `÷ ${keepRate}`)
                            .replace("{gross}", formatWon(simpleGross))
                        : null}
                    </div>
                  </div>
                ) : (
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("ft.net")}</div>
                    <div className="ec-value num">{formatWon(result.net)}</div>
                    <div className="ec-sub num">
                      {t("ft.totalTax")} {formatWon(result.totalTax)} ·{" "}
                      {t("ft.ofGross").replace("{pct}", pct(result.effectiveRate))}
                    </div>
                  </div>
                )}
                {reverse ? (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("ft.netAt")}</div>
                    <div className="ec-value num">{formatWon(result.net)}</div>
                  </div>
                ) : (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("ft.incomeTax")}</div>
                    <div className="ec-value num">{formatWon(result.incomeTax)}</div>
                  </div>
                )}
                {reverse ? (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("ft.totalTax")}</div>
                    <div className="ec-value num">{formatWon(result.totalTax)}</div>
                    <div className="ec-sub num">
                      {t("ft.ofGross").replace("{pct}", pct(result.effectiveRate))}
                    </div>
                  </div>
                ) : (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("ft.localTax")}</div>
                    <div className="ec-value num">{formatWon(result.localTax)}</div>
                  </div>
                )}
              </div>

              {result.belowMinimum ? <p className="ft-note">{t("ft.minimum")}</p> : null}
              {result.smallAmountExempt ? <p className="ft-note">{t("ft.smallOther")}</p> : null}
              {smallAmountNote ? <p className="ft-note">{t("ft.smallBusiness")}</p> : null}

              <div className="fw-breakdown">
                <h3>{t("ft.detail")}</h3>
                <div className="bd-row">
                  <span className="k">{t("ft.gross")}</span>
                  <span className="v num">{formatWon(result.gross)}</span>
                </div>
                {mode === "other" ? (
                  <>
                    <div className="bd-row sub">
                      <span className="k">{t("ft.expense")}</span>
                      <span className="v num">{formatWon(result.expense)}</span>
                    </div>
                    <div className="bd-row sub">
                      <span className="k">{t("ft.taxable")}</span>
                      <span className="v num">{formatWon(result.taxable)}</span>
                    </div>
                  </>
                ) : null}
                <div className="bd-row">
                  <span className="k">{t("ft.incomeTax")}</span>
                  <span className="v num">− {formatWon(result.incomeTax)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("ft.localTax")}</span>
                  <span className="v num">− {formatWon(result.localTax)}</span>
                </div>
                <div className="bd-row total">
                  <span className="k">{t("ft.net")}</span>
                  <span className="v num">{formatWon(result.net)}</span>
                </div>
              </div>

              <div className="sv-formula">
                <h3>{t("ft.formulaTitle")}</h3>
                <p className="sv-formula-rule num">
                  {mode === "business" ? t("ft.formulaBizTax") : t("ft.formulaOtherTax")}
                </p>
                <p className="sv-formula-calc num">
                  {result.belowMinimum
                    ? `${formatNumber(result.taxable)} ≤ 50,000 → 0`
                    : mode === "business"
                      ? `${formatNumber(result.gross)} × 3% = ${(result.gross * 0.03).toLocaleString("en-US", { maximumFractionDigits: 2 })} → ${formatWon(result.incomeTax)}`
                      : `${formatNumber(result.taxable)} × 20% = ${(result.taxable * 0.2).toLocaleString("en-US", { maximumFractionDigits: 2 })} → ${formatWon(result.incomeTax)}`}
                </p>
                <p className="sv-formula-rule num">{t("ft.formulaLocal")}</p>
                <p className="sv-formula-calc num">
                  {formatNumber(result.incomeTax)} × 10% ={" "}
                  {(result.incomeTax * 0.1).toLocaleString("en-US", { maximumFractionDigits: 1 })} →{" "}
                  {formatWon(result.localTax)}
                </p>
                <p className="sv-formula-calc is-final num">
                  {formatNumber(result.gross)} − {formatNumber(result.totalTax)} = {formatWon(result.net)}
                </p>
              </div>

              {compare ? (
                <div className="ft-compare">
                  <h3>{t("ft.compareTitle")}</h3>
                  <div className="ft-compare-row">
                    {[result, compare].map((r) => (
                      <div key={r.mode} className={`ft-compare-cell${r.mode === mode ? " is-current" : ""}`}>
                        <span className="k">
                          {r.mode === "business" ? t("ft.compareBusiness") : t("ft.compareOther")}
                        </span>
                        <span className="v num">{formatWon(r.net)}</span>
                      </div>
                    ))}
                  </div>
                  <p>{t("ft.compareNote")}</p>
                </div>
              ) : null}

              <div className="sc-basis">
                <h3>{t("ft.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("ft.basisRate")}</dt>
                    <dd>{mode === "business" ? t("ft.basisRateBiz") : t("ft.basisRateOther")}</dd>
                  </div>
                  <div>
                    <dt>{t("ft.basisRound")}</dt>
                    <dd>{t("ft.basisRoundValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("ft.basisVerified")}</dt>
                    <dd className="num">{FREELANCER_VERIFIED_AT}</dd>
                  </div>
                </dl>
                <p>{t("ft.basisNote")}</p>
              </div>

              <p className="sc-disclaimer">{t("ft.disclaimer")}</p>
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
