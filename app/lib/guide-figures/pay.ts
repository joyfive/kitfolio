/* 급여·세금 */
import type { GuideFigureMap } from "./types";

export const PAY_FIGURES: GuideFigureMap = {
  "salary-calculator": {
    ko: {
      caption: "세전 금액과 공제 조건을 넣으면 매달 받을 금액과 공제 내역이 나옵니다.",
      parts: [
        { t: "tabs", label: "급여 형태", items: ["연봉", "월급"], m: 1 },
        { t: "field", label: "금액", value: "52,000,000", unit: "원", m: 2 },
        { t: "fields", items: [{ label: "비과세 금액 (월)", value: "200,000", unit: "원" }, { label: "부양가족 수", value: "1", unit: "명" }], m: 3 },
        { t: "result", label: "예상 월 실수령액", value: "3,680,742원", sub: "세전 월 급여 4,333,333원", m: 4 },
        { t: "rows", items: [{ label: "국민연금", value: "196,333" }, { label: "건강보험", value: "148,593" }, { label: "총 공제", value: "652,591" }] },
      ],
      notes: [
        { title: "급여 형태", body: "계약서에 연봉이 적혀 있으면 연봉, 월 급여만 안다면 월급을 고르세요." },
        { title: "금액", body: "세전 금액을 넣으세요. 여러 제안을 비교할 때는 퇴직금 포함 여부 같은 기준을 맞춘 뒤 입력합니다." },
        { title: "공제 조건", body: "식대 같은 비과세 금액, 본인 포함 부양가족 수, 20세 이하 자녀 수, 원천징수 비율(80·100·120%)을 정합니다. 모르면 기본값으로 두세요." },
        { title: "실수령액과 공제 상세", body: "월·연 실수령액과 4대보험·소득세 항목별 금액을 확인하세요. 적용 요율의 기준일은 아래 계산 기준에 표시됩니다." },
      ],
    },
    en: {
      caption: "Enter your gross pay and deduction settings to see monthly take-home pay and each deduction.",
      parts: [
        { t: "tabs", label: "Pay type", items: ["Annual", "Monthly"], m: 1 },
        { t: "field", label: "Amount", value: "52,000,000", unit: "KRW", m: 2 },
        { t: "fields", items: [{ label: "Non-taxable (monthly)", value: "200,000", unit: "KRW" }, { label: "Dependents", value: "1" }], m: 3 },
        { t: "result", label: "Est. monthly take-home", value: "KRW 3,680,742", sub: "Gross monthly pay KRW 4,333,333", m: 4 },
        { t: "rows", items: [{ label: "National Pension", value: "196,333" }, { label: "Health Insurance", value: "148,593" }, { label: "Total deductions", value: "652,591" }] },
      ],
      notes: [
        { title: "Pay type", body: "Choose Annual if your contract states a yearly salary, or Monthly if you only know the monthly amount." },
        { title: "Amount", body: "Enter the gross amount. When comparing offers, put them on the same basis first, for example with or without severance." },
        { title: "Deduction settings", body: "Set non-taxable pay such as meal allowance, dependents including yourself, children under 20 and the withholding rate (80, 100 or 120%). Leave the defaults if unsure." },
        { title: "Take-home and breakdown", body: "Check monthly and yearly take-home pay and the amount for each insurance and tax item. The rate date is shown under Calculation basis." },
      ],
    },
  },

  "severance-pay-calculator": {
    ko: {
      caption: "근무 기간과 퇴직 전 3개월 임금을 넣으면 1일 평균임금과 예상 퇴직금이 나옵니다.",
      parts: [
        { t: "fields", items: [{ label: "입사일", value: "2021-03-02" }, { label: "마지막 근무일", value: "2026-08-27" }], m: 1 },
        { t: "field", label: "퇴직 전 3개월 임금 총액", value: "12,000,000", unit: "원", m: 2 },
        { t: "fields", items: [{ label: "최근 1년간 상여금", value: "3,000,000", unit: "원" }, { label: "연차수당", value: "500,000", unit: "원" }], m: 3 },
        { t: "result", label: "예상 퇴직금", value: "23,062,334원", sub: "1일 평균임금 139,946원 · 세전", m: 4 },
      ],
      notes: [
        { title: "근무 기간", body: "입사일과 마지막으로 출근한 날을 넣으세요. 퇴직일은 그다음 날로 자동 계산되고, 주 소정근로시간도 함께 확인합니다." },
        { title: "3개월 임금 총액", body: "퇴직 직전 3개월 동안 받은 세전 임금을 모두 더해 넣습니다. 급여명세서의 지급 합계를 쓰면 됩니다." },
        { title: "상여금 · 연차수당", body: "1년간 받은 상여금 총액을 넣으면 3개월분만 반영됩니다. 해당이 없으면 비워 두세요." },
        { title: "예상 퇴직금", body: "1일 평균임금 × 30 × 근속일수 ÷ 365로 계산한 세전 금액입니다. 1년 미만이거나 주 15시간 미만이면 지급 요건 미충족으로 표시됩니다." },
      ],
    },
    en: {
      caption: "Enter your dates and last three months of pay to get the average daily wage and severance estimate.",
      parts: [
        { t: "fields", items: [{ label: "Start date", value: "2021-03-02" }, { label: "Last working day", value: "2026-08-27" }], m: 1 },
        { t: "field", label: "Total wages, last 3 months", value: "12,000,000", unit: "KRW", m: 2 },
        { t: "fields", items: [{ label: "Bonuses, last 12 months", value: "3,000,000", unit: "KRW" }, { label: "Unused annual leave pay", value: "500,000", unit: "KRW" }], m: 3 },
        { t: "result", label: "Estimated severance pay", value: "KRW 23,062,334", sub: "Average daily wage KRW 139,946 · pre-tax", m: 4 },
      ],
      notes: [
        { title: "Employment period", body: "Enter your start date and the last day you work. The retirement date is set to the following day, and weekly contracted hours are checked too." },
        { title: "Wages for three months", body: "Add up the gross pay for the three months before leaving. The total on your payslips is what you need." },
        { title: "Bonuses and leave pay", body: "Enter the bonuses paid over the year and three months' worth is applied. Leave blank if none." },
        { title: "Estimated severance", body: "Pre-tax amount from average daily wage × 30 × days of service ÷ 365. Under one year or under 15 hours a week shows as not meeting the requirements." },
      ],
    },
  },

  "freelancer-tax-calculator": {
    ko: {
      caption: "소득 구분과 계산 방향을 고르고 금액을 넣으면 원천징수 세액과 실수령액이 나옵니다.",
      parts: [
        { t: "tabs", label: "소득 구분", items: ["사업소득 3.3%", "기타소득 8.8%"], m: 1 },
        { t: "tabs", label: "계산 방향", items: ["지급액 → 실수령액", "실수령액 → 지급액"], m: 2 },
        { t: "field", label: "지급액 (세전)", value: "3,000,000", unit: "원", m: 3 },
        { t: "result", label: "실수령액", value: "2,901,000원", m: 4 },
        { t: "stats", items: [{ label: "소득세", value: "90,000" }, { label: "지방소득세", value: "9,000" }] },
      ],
      notes: [
        { title: "소득 구분", body: "계속 반복하는 외주는 보통 사업소득 3.3%, 일회성 강연·원고료는 기타소득 8.8%입니다. 지급처가 신고하는 구분에 맞추세요." },
        { title: "계산 방향", body: "지급액에서 받을 돈을 보려면 지급액 → 실수령액, 받고 싶은 금액에서 청구액을 정하려면 실수령액 → 지급액을 고르세요." },
        { title: "금액", body: "세전 지급액이나 목표 실수령액을 넣습니다. 빠른 입력 버튼으로 자주 쓰는 금액을 바로 넣을 수 있습니다." },
        { title: "세액과 실수령액", body: "소득세와 지방소득세는 각각 10원 미만을 버립니다. 역산에서는 10원 절사까지 반영한 최소 지급액을 알려줍니다." },
      ],
    },
    en: {
      caption: "Choose the income type and direction, then enter an amount to see the tax withheld and net pay.",
      parts: [
        { t: "tabs", label: "Income type", items: ["Business income 3.3%", "Other income 8.8%"], m: 1 },
        { t: "tabs", label: "Direction", items: ["Fee → net pay", "Net pay → fee"], m: 2 },
        { t: "field", label: "Fee (before tax)", value: "3,000,000", unit: "KRW", m: 3 },
        { t: "result", label: "Net pay", value: "KRW 2,901,000", m: 4 },
        { t: "stats", items: [{ label: "Income tax", value: "90,000" }, { label: "Local income tax", value: "9,000" }] },
      ],
      notes: [
        { title: "Income type", body: "Recurring freelance work is usually business income at 3.3%, and a one-off talk or article is other income at 8.8%. Match what the payer reports." },
        { title: "Direction", body: "Choose Fee → net pay to see what you receive, or Net pay → fee to work out what to invoice for a target amount." },
        { title: "Amount", body: "Enter the gross fee or the net amount you want. Quick amount buttons fill in common values." },
        { title: "Tax and net pay", body: "Income tax and local income tax each drop anything under 10 won. The reverse direction gives the smallest fee that reaches your target after that rounding." },
      ],
    },
  },

  "income-tax-calculator": {
    ko: {
      caption: "올해와 작년 수입, 공제 정보를 넣으면 신고 방식별 5월 환급·납부액을 비교합니다.",
      parts: [
        { t: "fields", items: [{ label: "올해 수입금액", value: "30,000,000", unit: "원" }, { label: "직전연도 수입금액", value: "28,000,000", unit: "원" }], m: 1 },
        { t: "fields", items: [{ label: "업종코드", value: "940909" }, { label: "단순경비율", value: "64.1%" }], m: 2 },
        { t: "fields", items: [{ label: "부양가족 (본인 제외)", value: "0", unit: "명" }, { label: "국민연금 납부액 (연간)", value: "0", unit: "원" }], m: 3 },
        { t: "result", label: "5월 예상 환급", value: "455,180원", sub: "소득세 413,800 · 지방소득세 41,380", m: 4 },
      ],
      notes: [
        { title: "수입금액", body: "3.3%를 떼기 전 1년 동안 받은 금액의 합계를 넣으세요. 직전연도 수입이 단순경비율과 기준경비율 중 무엇을 쓸지 정합니다." },
        { title: "업종 경비율", body: "인적용역 940909의 고시 경비율이 들어 있습니다. 홈택스에서 조회한 내 업종 값이 다르면 직접 고칠 수 있습니다." },
        { title: "공제", body: "부양가족, 70세 이상·장애인 여부, 1년간 낸 국민연금을 넣습니다. 장부를 쓴다면 실제 경비도 넣어 간편장부와 비교하세요." },
        { title: "방식별 비교", body: "단순경비율·기준경비율·간편장부의 결정세액과 환급(−)·납부(+)가 나란히 나오고, 가장 유리한 방식이 표시됩니다." },
      ],
    },
    en: {
      caption: "Enter this year's and last year's revenue and your deductions to compare the May result for each filing method.",
      parts: [
        { t: "fields", items: [{ label: "Revenue this year", value: "30,000,000", unit: "KRW" }, { label: "Revenue last year", value: "28,000,000", unit: "KRW" }], m: 1 },
        { t: "fields", items: [{ label: "Industry code", value: "940909" }, { label: "Simple rate", value: "64.1%" }], m: 2 },
        { t: "fields", items: [{ label: "Dependents (excluding you)", value: "0" }, { label: "National pension paid (year)", value: "0", unit: "KRW" }], m: 3 },
        { t: "result", label: "Estimated May refund", value: "KRW 455,180", sub: "Income tax 413,800 · local income tax 41,380", m: 4 },
      ],
      notes: [
        { title: "Revenue", body: "Enter the total fees received during the year, before the 3.3% withholding. Last year's revenue decides whether the simple or standard expense rate applies." },
        { title: "Industry expense rates", body: "The published rates for personal services code 940909 are filled in. If your code on Hometax differs, edit them directly." },
        { title: "Deductions", body: "Enter dependents, anyone aged 70+ or with a disability, and the national pension paid in the year. If you keep books, add actual expenses to compare simplified bookkeeping." },
        { title: "Methods compared", body: "Shows tax due and the refund (−) or payment (+) for the simple rate, standard rate and simplified books side by side, with the best option marked." },
      ],
    },
  },

  "vat-calculator": {
    ko: {
      caption: "과세 유형과 계산 방향을 고르고 금액을 넣으면 부가세와 합계가 나옵니다.",
      parts: [
        { t: "tabs", label: "과세 유형", items: ["일반과세", "간이과세"], m: 1 },
        { t: "tabs", label: "계산 방향", items: ["공급가액 → 합계", "합계 → 공급가액"], m: 2 },
        { t: "field", label: "공급가액 (부가세 별도)", value: "1,000,000", unit: "원", m: 3 },
        { t: "result", label: "합계금액", value: "1,100,000원", m: 4 },
        { t: "stats", items: [{ label: "공급가액", value: "1,000,000" }, { label: "부가세", value: "100,000" }] },
      ],
      notes: [
        { title: "과세 유형", body: "견적·영수증 금액 계산은 일반과세 탭을, 간이과세자의 신고 세액과 납부 면제 여부는 간이과세 탭을 쓰세요." },
        { title: "계산 방향", body: "부가세 별도 금액에 10%를 더하려면 공급가액 → 합계, 부가세 포함 금액을 나누려면 합계 → 공급가액을 고르세요." },
        { title: "금액", body: "가진 금액이 부가세 포함인지 먼저 확인하고 넣으세요. 부가세 1원 미만은 절사·반올림·올림 중 고를 수 있습니다." },
        { title: "결과", body: "공급가액·부가세·합계를 확인합니다. 역산에서는 영수증 방식과 세금계산서 방식을 함께 보여줘 1원 차이가 왜 나는지 설명합니다." },
      ],
    },
    en: {
      caption: "Choose the taxpayer type and direction, enter an amount, and see the VAT and total.",
      parts: [
        { t: "tabs", label: "Taxpayer type", items: ["General taxpayer", "Simplified taxpayer"], m: 1 },
        { t: "tabs", label: "Direction", items: ["Supply value → total", "Total → supply value"], m: 2 },
        { t: "field", label: "Supply value (VAT excluded)", value: "1,000,000", unit: "KRW", m: 3 },
        { t: "result", label: "Total", value: "KRW 1,100,000", m: 4 },
        { t: "stats", items: [{ label: "Supply value", value: "1,000,000" }, { label: "VAT", value: "100,000" }] },
      ],
      notes: [
        { title: "Taxpayer type", body: "Use the general tab for quotes and receipts, and the simplified tab for a simplified taxpayer's VAT and whether payment is exempt." },
        { title: "Direction", body: "Choose Supply value → total to add 10% VAT, or Total → supply value to split an amount that already includes VAT." },
        { title: "Amount", body: "Check whether your amount includes VAT before entering it. You can choose to round down, round or round up VAT under 1 won." },
        { title: "Result", body: "Check the supply value, VAT and total. Working back from a total shows both the receipt and tax invoice methods to explain any 1 won difference." },
      ],
    },
  },

  "unemployment-benefit-calculator": {
    ko: {
      caption: "마지막 근무일과 임금, 가입기간을 넣으면 1일 금액·총액과 신청 기한이 나옵니다.",
      parts: [
        { t: "fields", items: [{ label: "마지막 근무일", value: "2026-10-31" }, { label: "1일 소정근로시간", value: "8", unit: "시간" }], m: 1 },
        { t: "field", label: "이직 사유", value: "권고사직 · 해고 · 계약 만료 · 폐업", select: true, m: 2 },
        { t: "fields", items: [{ label: "총 피보험기간", value: "4년 2개월" }, { label: "퇴직 전 3개월 임금 총액", value: "9,000,000", unit: "원" }], m: 3 },
        { t: "result", label: "예상 총 수급액", value: "11,888,640원", badge: "하한 적용", sub: "1일 66,048원 × 180일", m: 4 },
        { t: "rows", items: [{ label: "다 받기 위한 마지막 신청일", value: "2027-04-28", tone: "warn" }] },
      ],
      notes: [
        { title: "이직 정보", body: "마지막으로 출근한 날과 하루 소정근로시간을 넣으세요. 하루 금액의 하한이 근로시간에 따라 달라집니다." },
        { title: "이직 사유", body: "고른 사유는 판정이 아니라 안내용입니다. 단순 자진퇴사를 고르면 원칙적으로 대상이 아니라는 경고가 나옵니다." },
        { title: "가입기간과 임금", body: "고용보험 총 피보험기간과 50세 이상 여부가 받을 일수를 정하고, 퇴직 전 3개월 임금이 1일 금액을 정합니다." },
        { title: "수급액과 신청 기한", body: "1일 금액이 상한·하한 중 어디에 걸렸는지 함께 표시됩니다. 수급기간 12개월을 넘기지 않으려면 마지막 신청일 전에 신청하세요." },
      ],
    },
    en: {
      caption: "Enter your last working day, pay and insured period to see the daily amount, the total and the deadline to apply.",
      parts: [
        { t: "fields", items: [{ label: "Last working day", value: "2026-10-31" }, { label: "Daily contracted hours", value: "8", unit: "hrs" }], m: 1 },
        { t: "field", label: "Reason for leaving", value: "Recommended resignation · dismissal · contract end · closure", select: true, m: 2 },
        { t: "fields", items: [{ label: "Total insured period", value: "4 y 2 m" }, { label: "Total pay, last 3 months", value: "9,000,000", unit: "KRW" }], m: 3 },
        { t: "result", label: "Estimated total benefit", value: "KRW 11,888,640", badge: "Floor applied", sub: "KRW 66,048 a day × 180 days", m: 4 },
        { t: "rows", items: [{ label: "Last day to apply and receive every day", value: "2027-04-28", tone: "warn" }] },
      ],
      notes: [
        { title: "Leaving details", body: "Enter the last day you worked and your contracted daily hours. The floor for the daily amount depends on those hours." },
        { title: "Reason for leaving", body: "The reason is used for guidance, not a ruling. Choosing voluntary resignation shows a warning that it generally does not qualify." },
        { title: "Insured period and pay", body: "Your total insured period and whether you are 50 or over set the number of days. Pay for the last three months sets the daily amount." },
        { title: "Benefit and deadline", body: "The result shows whether the cap or floor applied. Apply before the last day shown so the 12 month benefit period does not cut days off." },
      ],
    },
  },
};
