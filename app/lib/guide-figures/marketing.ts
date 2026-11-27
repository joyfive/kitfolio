/* 광고·성과 */
import type { GuideFigureMap } from "./types";

export const MARKETING_FIGURES: GuideFigureMap = {
  "ad-metrics-calculator": {
    ko: {
      caption: "지표 탭과 계산 모드를 고르고 값을 넣으면 결과와 계산 공식이 함께 나옵니다.",
      parts: [
        { t: "tabs", items: ["ROAS", "CPA", "CPC", "CPM", "CTR"], m: 1 },
        { t: "chips", label: "계산 모드", items: ["ROAS 계산", "목표 매출 계산", "허용 광고비 계산"], active: [0], m: 2 },
        { t: "fields", items: [{ label: "광고비", value: "3,000,000" }, { label: "광고 매출", value: "12,600,000" }], m: 3 },
        { t: "result", label: "계산 결과", value: "420%", sub: "ROAS(%) = 광고 매출 ÷ 광고비 × 100", m: 4 },
        { t: "stats", items: [{ label: "ROAS 배수", value: "4.2x" }, { label: "광고비 대비 매출 차액", value: "9,600,000" }] },
      ],
      notes: [
        { title: "지표 탭", body: "확인할 지표를 고르세요. 탭을 바꾸면 주소의 ?mode= 값도 함께 바뀌어 그 상태로 공유할 수 있습니다." },
        { title: "계산 모드", body: "지표 자체를 구하거나, 목표 지표에서 필요한 매출·예산·전환 수를 거꾸로 계산하는 모드를 고릅니다." },
        { title: "값 입력", body: "광고비와 매출처럼 같은 기간, 같은 기준으로 집계한 수치를 넣으세요. 통화도 바꿀 수 있습니다." },
        { title: "결과와 공식", body: "결과 아래에 쓰인 공식이 함께 나와 보고서에 근거로 옮기기 좋습니다. 매출총이익률을 넣으면 손익분기 ROAS도 계산합니다." },
      ],
    },
    en: {
      caption: "Pick a metric tab and a mode, enter values, and get the result with its formula.",
      parts: [
        { t: "tabs", items: ["ROAS", "CPA", "CPC", "CPM", "CTR"], m: 1 },
        { t: "chips", label: "Calculation mode", items: ["Calculate ROAS", "Calculate target revenue", "Calculate allowable budget"], active: [0], m: 2 },
        { t: "fields", items: [{ label: "Ad spend", value: "3,000,000" }, { label: "Ad revenue", value: "12,600,000" }], m: 3 },
        { t: "result", label: "Result", value: "420%", sub: "ROAS (%) = ad revenue ÷ ad spend × 100", m: 4 },
        { t: "stats", items: [{ label: "ROAS multiple", value: "4.2x" }, { label: "Revenue minus spend", value: "9,600,000" }] },
      ],
      notes: [
        { title: "Metric tabs", body: "Pick the metric to check. Switching tabs also updates ?mode= in the address, so you can share that view." },
        { title: "Calculation mode", body: "Calculate the metric itself, or work back from a target to the revenue, budget or conversions you need." },
        { title: "Enter values", body: "Use numbers from the same period and the same attribution, such as spend and revenue. The currency can be changed too." },
        { title: "Result and formula", body: "The formula is shown under the result, ready to quote in a report. Add a gross margin to get the break-even ROAS." },
      ],
    },
  },

  "ad-budget-pacing-calculator": {
    ko: {
      caption: "예산과 기간, 지금까지 쓴 광고비를 넣으면 진행률과 소진율을 비교해 집행 상태를 알려줍니다.",
      parts: [
        { t: "field", label: "총 광고 예산", value: "10,000,000", m: 1 },
        { t: "fields", items: [{ label: "캠페인 시작일", value: "2026-11-01" }, { label: "캠페인 종료일", value: "2026-11-30" }, { label: "기준일", value: "2026-11-15" }], m: 2 },
        { t: "field", label: "기준일까지 사용한 광고비", value: "7,000,000", m: 3 },
        { t: "result", label: "페이싱 상태", value: "과다 집행", sub: "현재 계획보다 20%p 빠르게 예산을 사용하고 있습니다.", m: 4 },
        { t: "stats", items: [{ label: "기간 진행률", value: "50%" }, { label: "예산 소진율", value: "70%" }, { label: "필요 일평균", value: "200,000" }] },
      ],
      notes: [
        { title: "총 광고 예산", body: "캠페인 전체 기간에 쓸 예산을 넣으세요." },
        { title: "기간과 기준일", body: "시작일·종료일과 확인하는 날을 넣습니다. 주말에 집행하지 않는다면 집행 기준을 평일만으로 바꾸세요." },
        { title: "사용한 광고비", body: "광고 관리자에서 기준일까지 집계된 누적 지출을 넣습니다." },
        { title: "페이싱 상태", body: "기간 진행률과 예산 소진율의 차이로 과다·정상·부족을 판단합니다. 남은 기간에 맞추려면 하루 얼마씩 써야 하는지도 함께 나옵니다." },
      ],
    },
    en: {
      caption: "Enter the budget, dates and spend so far to compare time progress with budget burn.",
      parts: [
        { t: "field", label: "Total budget", value: "10,000,000", m: 1 },
        { t: "fields", items: [{ label: "Campaign start date", value: "2026-11-01" }, { label: "Campaign end date", value: "2026-11-30" }, { label: "Reference date", value: "2026-11-15" }], m: 2 },
        { t: "field", label: "Spend to date", value: "7,000,000", m: 3 },
        { t: "result", label: "Pacing status", value: "Overpacing", sub: "Spending 20%pt faster than planned.", m: 4 },
        { t: "stats", items: [{ label: "Time progress", value: "50%" }, { label: "Budget burn rate", value: "70%" }, { label: "Required daily", value: "200,000" }] },
      ],
      notes: [
        { title: "Total budget", body: "Enter the budget for the whole campaign." },
        { title: "Dates and reference date", body: "Enter the start and end dates and the day you are checking. If ads do not run at weekends, switch running days to weekdays only." },
        { title: "Spend to date", body: "Enter the cumulative spend your ad manager reports up to the reference date." },
        { title: "Pacing status", body: "Compares time progress with budget burn to call it over, on track or under, and shows the daily spend needed for the rest of the campaign." },
      ],
    },
  },

  "funnel-conversion-calculator": {
    ko: {
      caption: "단계별 인원수를 넣으면 전환율과 이탈률, 가장 약한 구간을 찾아줍니다.",
      parts: [
        { t: "tabs", label: "모드", items: ["현재 퍼널 분석", "목표 역산"], m: 1 },
        { t: "rows", items: [{ label: "방문", value: "10,000" }, { label: "장바구니", value: "2,000" }, { label: "결제시작", value: "800" }, { label: "구매", value: "500" }], m: 2 },
        { t: "result", label: "전체 전환율", value: "5%", m: 3 },
        { t: "rows", items: [{ label: "최저 전환율 구간", value: "방문 → 장바구니 20%", tone: "bad" }, { label: "결제시작 → 구매", value: "62.5%" }], m: 4 },
      ],
      notes: [
        { title: "모드", body: "지금 퍼널을 진단하려면 현재 퍼널 분석, 목표 구매 수에서 필요한 방문 수를 구하려면 목표 역산을 고르세요." },
        { title: "단계와 수량", body: "같은 기간·같은 집단의 단계별 인원수를 위에서부터 넣습니다. 퍼널 프리셋으로 시작하고 단계 이름을 바꿔도 됩니다. 최대 10단계까지 추가할 수 있습니다." },
        { title: "전체 전환율", body: "첫 단계에서 마지막 단계까지 남은 비율입니다." },
        { title: "단계별 결과", body: "단계마다 전환율·이탈률·누적 전환율이 나오고, 전환율이 가장 낮거나 이탈이 가장 큰 구간이 따로 표시됩니다." },
      ],
    },
    en: {
      caption: "Enter the count at each stage to see conversion, drop-off and the weakest step.",
      parts: [
        { t: "tabs", label: "Mode", items: ["Funnel analysis", "Reverse planning"], m: 1 },
        { t: "rows", items: [{ label: "Visit", value: "10,000" }, { label: "Cart", value: "2,000" }, { label: "Checkout start", value: "800" }, { label: "Purchase", value: "500" }], m: 2 },
        { t: "result", label: "Overall conversion rate", value: "5%", m: 3 },
        { t: "rows", items: [{ label: "Lowest conversion stage", value: "Visit → Cart 20%", tone: "bad" }, { label: "Checkout start → Purchase", value: "62.5%" }], m: 4 },
      ],
      notes: [
        { title: "Mode", body: "Use Funnel analysis to diagnose the current funnel, or Reverse planning to work back from a purchase target to the visits you need." },
        { title: "Stages and counts", body: "Enter counts from the same period and group, top stage first. Start from a preset and rename stages if you like. Up to 10 stages are allowed." },
        { title: "Overall conversion rate", body: "The share that makes it from the first stage to the last." },
        { title: "Stage results", body: "Each stage shows conversion, drop-off and cumulative rate, and the step with the lowest conversion or largest drop-off is called out." },
      ],
    },
  },

  "growth-rate-calculator": {
    ko: {
      caption: "계산할 탭을 고르고 두 값을 넣으면 변화율과 차이, 배수가 나옵니다.",
      parts: [
        { t: "tabs", items: ["성장률", "퍼센트 차이", "목표 성장률", "필요 증가량", "역산"], m: 1 },
        { t: "fields", items: [{ label: "이전 값", value: "1,250,000" }, { label: "현재 값", value: "1,437,500" }], m: 2 },
        { t: "result", label: "변화율", value: "+15.00%", badge: "증가", m: 3 },
        { t: "stats", items: [{ label: "차이", value: "+187,500" }, { label: "배수", value: "1.15x" }], m: 4 },
      ],
      notes: [
        { title: "계산 탭", body: "전월·전년 대비 변화는 성장률, 두 값의 상대 차이는 퍼센트 차이, 목표까지 남은 폭은 필요 증가량처럼 질문에 맞는 탭을 고르세요." },
        { title: "값 입력", body: "지난 기간 값과 이번 기간 값을 같은 단위로 넣습니다. 빠른 예시를 눌러 형식을 먼저 확인할 수도 있습니다." },
        { title: "변화율", body: "증가는 +, 감소는 −로 표시됩니다. 이전 값이 0이면 성장률을 계산할 수 없다고 알려줍니다." },
        { title: "차이와 배수", body: "절대 증가량과 몇 배가 되었는지를 함께 확인하고, 계산식과 결과를 복사해 보고서에 붙이세요." },
      ],
    },
    en: {
      caption: "Pick a tab and enter two values to get the change rate, difference and multiple.",
      parts: [
        { t: "tabs", items: ["Growth Rate", "% Difference", "Goal Growth", "Required Growth", "Reverse Growth"], m: 1 },
        { t: "fields", items: [{ label: "Previous Value", value: "1,250,000" }, { label: "Current Value", value: "1,437,500" }], m: 2 },
        { t: "result", label: "Change Rate", value: "+15.00%", badge: "Increase", m: 3 },
        { t: "stats", items: [{ label: "Difference", value: "+187,500" }, { label: "Multiplier", value: "1.15x" }], m: 4 },
      ],
      notes: [
        { title: "Calculation tab", body: "Choose the tab that matches the question: Growth Rate for period over period change, % Difference for two peers, Required Growth for the gap to a target." },
        { title: "Enter values", body: "Enter the earlier and later values in the same unit. Quick examples show the expected format." },
        { title: "Change rate", body: "Increases show with +, decreases with −. A previous value of zero is flagged because growth cannot be calculated." },
        { title: "Difference and multiple", body: "Check the absolute change and how many times larger the value became, then copy the formula and result into your report." },
      ],
    },
  },

  "cagr-calculator": {
    ko: {
      caption: "시작 값과 종료 값, 기간을 넣으면 연평균 성장률과 총 성장률이 나옵니다.",
      parts: [
        { t: "tabs", items: ["CAGR", "복리 성장"], m: 1 },
        { t: "fields", items: [{ label: "시작 값", value: "120,000,000" }, { label: "종료 값", value: "210,000,000" }], m: 2 },
        { t: "field", label: "기간 (년)", value: "3", m: 3 },
        { t: "result", label: "CAGR", value: "+20.51%", m: 4 },
        { t: "stats", items: [{ label: "총 성장률", value: "+75.00%" }, { label: "최종 배수", value: "1.75x" }] },
      ],
      notes: [
        { title: "계산 탭", body: "과거 성장의 연평균을 구하려면 CAGR, 일정한 성장률로 몇 년 뒤 값을 예측하려면 복리 성장을 고르세요." },
        { title: "시작 값과 종료 값", body: "첫해와 마지막 해의 값을 같은 단위로 넣습니다." },
        { title: "기간", body: "두 값 사이에 지난 햇수입니다. 2023년 값과 2026년 값이라면 3년입니다." },
        { title: "CAGR과 총 성장률", body: "해마다 같은 비율로 자랐다고 볼 때의 연 성장률입니다. 실제로는 해마다 들쭉날쭉했을 수 있으니 총 성장률과 함께 보세요." },
      ],
    },
    en: {
      caption: "Enter a start value, an end value and the years between to get the annual growth rate and total growth.",
      parts: [
        { t: "tabs", items: ["CAGR", "Compound"], m: 1 },
        { t: "fields", items: [{ label: "Start Value", value: "120,000,000" }, { label: "End Value", value: "210,000,000" }], m: 2 },
        { t: "field", label: "Number of Years", value: "3", m: 3 },
        { t: "result", label: "CAGR", value: "+20.51%", m: 4 },
        { t: "stats", items: [{ label: "Total Growth", value: "+75.00%" }, { label: "Final Multiplier", value: "1.75x" }] },
      ],
      notes: [
        { title: "Calculation tab", body: "Choose CAGR to annualize past growth, or Compound to project a future value at a constant rate." },
        { title: "Start and end values", body: "Enter the first and last year's values in the same unit." },
        { title: "Number of years", body: "The years between the two values. Values from 2023 and 2026 are three years apart." },
        { title: "CAGR and total growth", body: "The rate that would give the same result if growth were equal each year. Real growth may have been uneven, so read it alongside total growth." },
      ],
    },
  },
};
