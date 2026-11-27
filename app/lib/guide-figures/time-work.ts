/* 날짜·시간 · 근무·휴가 */
import type { GuideFigureMap } from "./types";

export const TIME_WORK_FIGURES: GuideFigureMap = {
  "kst-utc-converter": {
    ko: {
      caption: "변환 방향을 고르고 시각을 넣으면 결과와 날짜 변화, 변환 코드가 함께 나옵니다.",
      parts: [
        { t: "tabs", label: "변환 방향", items: ["UTC → KST", "KST → UTC"], m: 1 },
        { t: "field", label: "날짜·시간", value: "2026-10-20T18:30:05Z", hint: "시간대 표기가 없으면 UTC로 해석합니다.", m: 2 },
        { t: "rows", items: [{ label: "날짜·시간", value: "2026-10-21 03:30:05" }, { label: "시간대", value: "KST (UTC+09:00)" }, { label: "날짜 변화", value: "다음 날", tone: "warn" }], m: 3 },
        { t: "code", tabs: ["JavaScript", "Python", "Go"], lines: ["const kst = utcToKst(\"2026-10-20T18:30:05Z\");", "// → 2026-10-21T03:30:05+09:00"], m: 4 },
      ],
      notes: [
        { title: "변환 방향", body: "가진 시각이 UTC라면 UTC → KST, 한국 시간이라면 KST → UTC를 고르세요. 현재 시각 버튼으로 지금 시각을 바로 넣을 수도 있습니다." },
        { title: "날짜·시간", body: "ISO 문자열이나 2026-10-20 18:30:00 같은 형식을 붙여 넣으세요. 시간대 표기가 없으면 고른 입력 시간대로 읽고, 표기가 다르면 오류로 알려줍니다." },
        { title: "변환 결과", body: "바뀐 시각과 시간대, 날짜 변화를 확인하세요. 9시간 차이 때문에 날짜가 넘어가면 다음 날이나 전날로 표시됩니다." },
        { title: "언어별 변환 코드", body: "JavaScript·Python·Go 등 탭에서 함수만 복사하거나, 현재 입력이 들어간 전체 예제를 복사합니다." },
      ],
    },
    en: {
      caption: "Pick a direction and enter a time to see the result, the day change and ready-to-copy code.",
      parts: [
        { t: "tabs", label: "Direction", items: ["UTC → KST", "KST → UTC"], m: 1 },
        { t: "field", label: "Date and time", value: "2026-10-20T18:30:05Z", hint: "Input without a zone is read as UTC.", m: 2 },
        { t: "rows", items: [{ label: "Date and time", value: "2026-10-21 03:30:05" }, { label: "Time zone", value: "KST (UTC+09:00)" }, { label: "Day change", value: "Next day", tone: "warn" }], m: 3 },
        { t: "code", tabs: ["JavaScript", "Python", "Go"], lines: ["const kst = utcToKst(\"2026-10-20T18:30:05Z\");", "// → 2026-10-21T03:30:05+09:00"], m: 4 },
      ],
      notes: [
        { title: "Direction", body: "Choose UTC → KST for a UTC time, or KST → UTC for a Korean time. The current time button fills in the time right now." },
        { title: "Date and time", body: "Paste an ISO string or a value such as 2026-10-20 18:30:00. Input without a zone is read in the chosen input zone, and a conflicting zone is flagged as an error." },
        { title: "Result", body: "Check the converted time, zone and day change. When the nine hour offset crosses midnight, it shows next day or previous day." },
        { title: "Code by language", body: "Copy just the function from the JavaScript, Python, Go and other tabs, or the full example with your current input." },
      ],
    },
  },

  "slack-timestamp-converter": {
    ko: {
      caption: "타임스탬프나 날짜를 넣으면 여러 형식과 Slack 날짜 구문이 한 번에 나옵니다.",
      parts: [
        { t: "text", label: "입력", value: "1718071200", mono: true, m: 1 },
        { t: "rows", items: [{ label: "UTC", value: "2024-06-11 02:00:00" }, { label: "Local", value: "2024-06-11 11:00:00" }, { label: "Unix (초)", value: "1718071200" }], m: 2 },
        { t: "code", title: "Slack 구문", lines: ["<!date^1718071200^{date_short_pretty} at {time}|Jun 11, 2024 11:00 AM>"], m: 3 },
      ],
      notes: [
        { title: "입력", body: "Unix 초·밀리초·마이크로초, ISO 날짜, Slack 메시지의 ts 값, <!date^...> 구문 중 무엇이든 붙여 넣으세요. 형식은 자동으로 알아봅니다." },
        { title: "변환 결과", body: "UTC와 내 브라우저 시간대, 읽기 쉬운 날짜, 지금으로부터 얼마 전인지가 함께 나옵니다. 각 줄은 바로 복사할 수 있습니다." },
        { title: "Slack 구문", body: "메시지에 붙이면 읽는 사람마다 자기 시간대로 시각이 보입니다. | 뒤의 문구는 구문을 지원하지 않는 화면에서 대신 보입니다." },
      ],
    },
    en: {
      caption: "Enter a timestamp or date to get every format plus Slack's date syntax at once.",
      parts: [
        { t: "text", label: "Input", value: "1718071200", mono: true, m: 1 },
        { t: "rows", items: [{ label: "UTC", value: "2024-06-11 02:00:00" }, { label: "Local", value: "2024-06-11 11:00:00" }, { label: "Unix (seconds)", value: "1718071200" }], m: 2 },
        { t: "code", title: "Slack syntax", lines: ["<!date^1718071200^{date_short_pretty} at {time}|Jun 11, 2024 11:00 AM>"], m: 3 },
      ],
      notes: [
        { title: "Input", body: "Paste Unix seconds, milliseconds or microseconds, an ISO date, a Slack message ts value or a <!date^...> token. The format is detected automatically." },
        { title: "Results", body: "Shows UTC, your browser's time zone, a readable date and how long ago it was. Each row copies with one click." },
        { title: "Slack syntax", body: "Paste it into a message and each reader sees the time in their own zone. The text after | is shown where the syntax is not supported." },
      ],
    },
  },

  "time-calculator": {
    ko: {
      caption: "시간 블록을 줄마다 넣고 더하거나 빼면 합계가 여러 형식으로 나옵니다.",
      parts: [
        { t: "fields", items: [{ label: "+ 오전", value: "4", unit: "시" }, { label: " ", value: "15", unit: "분" }], m: 1 },
        { t: "fields", items: [{ label: "+ 오후", value: "3", unit: "시" }, { label: " ", value: "50", unit: "분" }] },
        { t: "buttons", items: ["항목 추가"], primary: -1, m: 2 },
        { t: "result", label: "합계", value: "8시간 5분", m: 3 },
        { t: "stats", items: [{ label: "소수점 시간", value: "8.083" }, { label: "총 분", value: "485" }], m: 4 },
      ],
      notes: [
        { title: "시간 블록", body: "작업 하나를 한 줄에 시·분·초로 넣으세요. 줄마다 +와 −를 바꿀 수 있어, 쉬는 시간은 −로 넣으면 빠집니다." },
        { title: "항목 추가", body: "줄을 늘리거나 지우면서 하루 일정을 맞춥니다. 줄 순서는 합계에 영향을 주지 않습니다." },
        { title: "합계", body: "모든 줄을 더하고 뺀 결과가 시·분으로 나옵니다." },
        { title: "다른 형식", body: "타임시트나 청구서에 맞춰 소수점 시간·총 분·총 초 중 필요한 값을 복사하세요." },
      ],
    },
    en: {
      caption: "Enter each block of time on its own row, add or subtract, and get the total in several formats.",
      parts: [
        { t: "fields", items: [{ label: "+ Morning", value: "4", unit: "h" }, { label: " ", value: "15", unit: "m" }], m: 1 },
        { t: "fields", items: [{ label: "+ Afternoon", value: "3", unit: "h" }, { label: " ", value: "50", unit: "m" }] },
        { t: "buttons", items: ["Add row"], primary: -1, m: 2 },
        { t: "result", label: "Total", value: "8h 5m", m: 3 },
        { t: "stats", items: [{ label: "Decimal hours", value: "8.083" }, { label: "Total minutes", value: "485" }], m: 4 },
      ],
      notes: [
        { title: "Time blocks", body: "Enter one task per row in hours, minutes and seconds. Each row toggles between + and −, so breaks entered as − are subtracted." },
        { title: "Add row", body: "Add or remove rows to match your day. Row order does not affect the total." },
        { title: "Total", body: "Shows the sum of every row in hours and minutes." },
        { title: "Other formats", body: "Copy decimal hours, total minutes or total seconds, whichever your timesheet or invoice expects." },
      ],
    },
  },

  "time-converter": {
    ko: {
      caption: "숫자와 단위를 넣고 계산 기준을 고르면 모든 단위로 한 번에 바뀝니다.",
      parts: [
        { t: "field", label: "시간 입력", value: "200", unit: "시간 ▾", m: 1 },
        { t: "tabs", label: "계산 기준", items: ["캘린더 기준", "근무 기준"], active: 1, m: 2 },
        { t: "rows", title: "변환 결과", items: [{ label: "분", value: "12,000" }, { label: "일", value: "25" }, { label: "주", value: "5" }, { label: "개월", value: "1.15" }], m: 3 },
      ],
      notes: [
        { title: "시간 입력", body: "숫자를 넣고 오른쪽에서 초·분·시간·일·주·개월·년 중 단위를 고르세요." },
        { title: "계산 기준", body: "달력 기간이면 캘린더 기준(1일 24시간·1주 7일), 근무량이면 근무 기준(1일 8시간·1주 5일)을 고르세요. 같은 200시간도 기준에 따라 일수가 크게 달라집니다." },
        { title: "변환 결과", body: "모든 단위의 값이 함께 나옵니다. 보고에 쓸 단위의 값을 복사하세요. 1개월 길이는 평균값이라 근사치입니다." },
      ],
    },
    en: {
      caption: "Enter a number and unit, choose a basis, and see every unit at once.",
      parts: [
        { t: "field", label: "Time input", value: "200", unit: "hours ▾", m: 1 },
        { t: "tabs", label: "Basis", items: ["Calendar", "Work"], active: 1, m: 2 },
        { t: "rows", title: "Results", items: [{ label: "Minutes", value: "12,000" }, { label: "Days", value: "25" }, { label: "Weeks", value: "5" }, { label: "Months", value: "1.15" }], m: 3 },
      ],
      notes: [
        { title: "Time input", body: "Enter a number and pick seconds, minutes, hours, days, weeks, months or years on the right." },
        { title: "Basis", body: "Use calendar (24 h a day, 7 days a week) for elapsed time and work (8 h a day, 5 days a week) for effort. The same 200 hours gives very different day counts." },
        { title: "Results", body: "Every unit is shown together. Copy the one you need for your report. Month lengths are averages, so treat them as approximate." },
      ],
    },
  },

  "lunar-solar-converter": {
    ko: {
      caption: "변환 방향을 고르고 날짜를 넣으면 반대 달력의 날짜와 간지·띠가 나옵니다.",
      parts: [
        { t: "tabs", items: ["양력 → 음력", "음력 → 양력"], active: 1, m: 1 },
        { t: "fields", items: [{ label: "연도 (1901~2100)", value: "1958" }, { label: "월", value: "3" }, { label: "일", value: "12" }], m: 2 },
        { t: "check", label: "윤달", m: 3 },
        { t: "result", label: "양력", value: "1958년 4월 30일 (수)", sub: "간지 무술년 · 띠 개", m: 4 },
      ],
      notes: [
        { title: "변환 방향", body: "음력 생일을 달력에 넣으려면 음력 → 양력, 오늘이 음력으로 며칠인지 보려면 양력 → 음력을 고르세요." },
        { title: "연·월·일", body: "1901~2100년 사이 날짜를 입력합니다. 오늘 날짜로 버튼을 누르면 오늘이 바로 채워집니다." },
        { title: "윤달", body: "그해 해당 월에 윤달이 있을 때만 켤 수 있습니다. 같은 3월이라도 평달과 윤달은 양력 날짜가 다릅니다." },
        { title: "변환 결과", body: "날짜와 요일, 간지·띠를 확인하고 결과 복사로 가져가세요. 음력 기념일은 해마다 양력 날짜가 바뀌니 매년 다시 확인하세요." },
      ],
    },
    en: {
      caption: "Pick a direction and enter a date to get the other calendar's date with its ganzhi year and zodiac.",
      parts: [
        { t: "tabs", items: ["Solar → Lunar", "Lunar → Solar"], active: 1, m: 1 },
        { t: "fields", items: [{ label: "Year (1901-2100)", value: "1958" }, { label: "Month", value: "3" }, { label: "Day", value: "12" }], m: 2 },
        { t: "check", label: "Leap month", m: 3 },
        { t: "result", label: "Solar", value: "Apr 30, 1958 (Wed)", sub: "Ganzhi Wuxu · zodiac Dog", m: 4 },
      ],
      notes: [
        { title: "Direction", body: "Choose Lunar → Solar to put a lunar birthday on your calendar, or Solar → Lunar to see today's lunar date." },
        { title: "Year, month, day", body: "Enter a date between 1901 and 2100. The today button fills in today's date." },
        { title: "Leap month", body: "Available only when that month has a leap month in the chosen year. A leap month and the ordinary month of the same number map to different solar dates." },
        { title: "Result", body: "Check the date, weekday, ganzhi year and zodiac, then copy it. Lunar anniversaries move every year, so check again each year." },
      ],
    },
  },

  "flex-work-calculator": {
    ko: {
      caption: "이번 달 조건과 쓴 휴가, 지금까지 일한 시간을 넣으면 남은 날 하루 평균이 나옵니다.",
      parts: [
        { t: "fields", items: [{ label: "연도", value: "2026" }, { label: "월", value: "11" }, { label: "1일 소정근로", value: "8", unit: "시간" }], m: 1 },
        { t: "fields", items: [{ label: "연차", value: "1", unit: "일" }, { label: "반차", value: "0", unit: "회" }, { label: "시간차", value: "0", unit: "시간" }], m: 2 },
        { t: "field", label: "현재 누적 근무시간", value: "72", unit: "시간", m: 3 },
        { t: "result", label: "남은 기간 하루 평균", value: "8시간 0분", sub: "남은 영업일마다 이만큼 일하면 목표 달성", m: 4 },
        { t: "stats", items: [{ label: "이번 달 목표", value: "160h" }, { label: "남은 목표", value: "88h" }, { label: "남은 영업일", value: "11일" }] },
      ],
      notes: [
        { title: "근무 조건", body: "확인할 연·월과 하루 소정근로시간을 넣으세요. 그 달의 영업일과 공휴일은 자동으로 반영됩니다." },
        { title: "사용한 휴가", body: "연차는 하루, 반차는 절반, 시간차는 넣은 시간만큼 월 목표에서 빠집니다." },
        { title: "현재 누적 근무시간", body: "근태 시스템에 찍힌 이번 달 누적 시간을 넣으세요. 오늘을 남은 영업일에 넣을지도 고를 수 있습니다." },
        { title: "하루 평균과 여유·부족", body: "남은 영업일마다 몇 시간 일해야 목표를 채우는지, 정시 근무로 채우면 얼마나 남거나 모자라는지 확인하세요." },
      ],
    },
    en: {
      caption: "Enter this month's schedule, leave used and hours worked to get the daily average you need.",
      parts: [
        { t: "fields", items: [{ label: "Year", value: "2026" }, { label: "Month", value: "11" }, { label: "Daily hours", value: "8", unit: "hrs" }], m: 1 },
        { t: "fields", items: [{ label: "Full-day", value: "1", unit: "days" }, { label: "Half-day", value: "0", unit: "×" }, { label: "Hourly", value: "0", unit: "hrs" }], m: 2 },
        { t: "field", label: "Hours worked so far", value: "72", unit: "hrs", m: 3 },
        { t: "result", label: "Required daily average", value: "8h 0m", sub: "per remaining business day to hit your target", m: 4 },
        { t: "stats", items: [{ label: "Monthly target", value: "160h" }, { label: "Remaining", value: "88h" }, { label: "Business days left", value: "11" }] },
      ],
      notes: [
        { title: "Your schedule", body: "Enter the year, month and your contracted daily hours. Business days and public holidays for that month are applied automatically." },
        { title: "Leave used", body: "A full day, half a day or the hours you enter come off the monthly target." },
        { title: "Hours worked so far", body: "Enter this month's total from your time tracking system. You can also choose whether today counts as a remaining day." },
        { title: "Daily average and balance", body: "See how many hours each remaining business day needs, and how far ahead or behind you would be by working standard hours." },
      ],
    },
  },

  "annual-leave-calculator": {
    ko: {
      caption: "부여 기준을 고르고 입사일과 기준일을 넣으면 쓸 수 있는 연차와 다음 발생일이 나옵니다.",
      parts: [
        { t: "tabs", label: "부여 기준", items: ["입사일 기준", "회계연도 기준"], m: 1 },
        { t: "fields", items: [{ label: "입사일", value: "2025-03-01" }, { label: "기준일", value: "2026-10-01" }], m: 2 },
        { t: "tabs", label: "재직 상태", items: ["재직 중", "퇴사 예정"], m: 3 },
        { t: "result", label: "지금 쓸 수 있는 연차", value: "15일", sub: "발생 26일 중 소멸·사용 제외", m: 4 },
        { t: "stats", items: [{ label: "다음 발생", value: "2027-03-01 · 15일" }] },
      ],
      notes: [
        { title: "부여 기준", body: "회사가 연차를 입사일마다 주는지, 1월 1일 같은 회계연도에 맞춰 주는지 확인해 고르세요." },
        { title: "입사일과 기준일", body: "기준일은 연차를 확인하려는 날입니다. 기간은 입사일부터 다시 세며, 1년이 지난 다음 날 연차가 생깁니다." },
        { title: "재직 상태", body: "퇴사 예정이면 마지막 근무일을 넣습니다. 이때 두 기준의 총 발생을 비교해 정산 차이를 보여줍니다." },
        { title: "남은 연차와 발생 내역", body: "지금 쓸 수 있는 일수, 다음 발생일, 소멸된 월 단위 연차를 확인하세요. 1일 통상임금을 넣으면 미사용 수당도 계산합니다." },
      ],
    },
    en: {
      caption: "Choose the granting basis and enter your dates to see the leave you can use and the next accrual.",
      parts: [
        { t: "tabs", label: "Granting basis", items: ["Hire date", "Calendar year"], m: 1 },
        { t: "fields", items: [{ label: "Start date", value: "2025-03-01" }, { label: "As of", value: "2026-10-01" }], m: 2 },
        { t: "tabs", label: "Status", items: ["Employed", "Leaving"], m: 3 },
        { t: "result", label: "Leave you can use now", value: "15 days", sub: "Of 26 earned, after expiry and use", m: 4 },
        { t: "stats", items: [{ label: "Next accrual", value: "2027-03-01 · 15 days" }] },
      ],
      notes: [
        { title: "Granting basis", body: "Check whether your workplace grants leave on each work anniversary or on a fixed date such as 1 January, and choose that." },
        { title: "Start date and as of", body: "The as-of date is the day you want to check. Periods are counted from the start date, and leave accrues the day after each full year." },
        { title: "Status", body: "If you are leaving, enter the last working day. The tool then compares the total earned on each basis to show any settlement difference." },
        { title: "Remaining leave and history", body: "Check the days you can use, the next accrual and any monthly leave that expired. Add your daily ordinary wage to estimate pay for unused leave." },
      ],
    },
  },
};
