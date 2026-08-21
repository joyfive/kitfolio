# 작업 지시서: Business Growth Calculator Series

## 0. 목표

KitFolio에 성장률·증감률·기간 비교·목표 성장·복리 성장 계산기를 한 번에 추가한다.

**핵심 원칙**

- URL은 개별 페이지
- 같은 계산군은 탭 메뉴로 연결
- 계산 로직은 공통 엔진 재사용
- 각 페이지는 SEO 키워드와 예시 문구만 다르게 구성

---

## 1. Path 구조

```
app/
  growth-rate-calculator/
  percentage-change-calculator/
  percentage-increase-calculator/
  percentage-decrease-calculator/
  percent-difference-calculator/
  mom-growth-calculator/
  yoy-growth-calculator/
  qoq-growth-calculator/
  wow-growth-calculator/
  goal-growth-calculator/
  required-growth-calculator/
  reverse-growth-calculator/
  cagr-calculator/
  compound-growth-calculator/
  growth-projection-calculator/
```

---

## 2. 공통 컴포넌트 구조

```
components/
  calculators/
    GrowthCalculator/
      GrowthCalculator.tsx
      GrowthTabs.tsx
      GrowthResultCard.tsx
      GrowthInput.tsx
      QuickExamples.tsx
      calculatorConfig.ts
      growthMath.ts
      formatNumber.ts
```

---

## 3. 계산기 그룹

### Group A. Percentage Change Series

**탭 메뉴 있음**

- Growth Rate
- Percentage Change
- Percentage Increase
- Percentage Decrease
- Percent Difference

**페이지 목록**

| Path | H1 | 목적 |
|------|----|------|
| `/growth-rate-calculator` | Growth Rate Calculator | 시작값과 종료값으로 성장률 계산 |
| `/percentage-change-calculator` | Percentage Change Calculator | 증가/감소를 자동 판단해 변화율 계산 |
| `/percentage-increase-calculator` | Percentage Increase Calculator | 증가율 계산에 특화 |
| `/percentage-decrease-calculator` | Percentage Decrease Calculator | 감소율 계산에 특화 |
| `/percent-difference-calculator` | Percent Difference Calculator | 두 값의 상대적 차이 계산 |

**필수 키워드**

- growth rate calculator
- percentage change calculator
- percentage increase calculator
- percentage decrease calculator
- percent difference calculator
- increase decrease calculator

**입력값**

- Start Value
- End Value

**출력값**

- Change Rate
- Difference
- Multiplier
- Direction
- Formula

**계산식**

```
Change Rate = (End - Start) / Start × 100
Difference  = End - Start
Multiplier  = End / Start
```

Percent Difference만 별도:

```
Percent Difference = |A - B| / ((A + B) / 2) × 100
```

**Related Tools**

- CAGR Calculator
- Goal Growth Calculator
- MoM Growth Calculator
- Percentage Calculator

---

### Group B. Period Comparison Series

**탭 메뉴 있음**

- MoM
- YoY
- QoQ
- WoW

**페이지 목록**

| Path | H1 | 목적 |
|------|----|------|
| `/mom-growth-calculator` | MoM Growth Calculator | 전월 대비 성장률 계산 |
| `/yoy-growth-calculator` | YoY Growth Calculator | 전년 대비 성장률 계산 |
| `/qoq-growth-calculator` | QoQ Growth Calculator | 전분기 대비 성장률 계산 |
| `/wow-growth-calculator` | WoW Growth Calculator | 전주 대비 성장률 계산 |

**필수 키워드**

- MoM growth calculator
- YoY growth calculator
- QoQ growth calculator
- WoW growth calculator
- month over month growth
- year over year growth
- quarter over quarter growth
- week over week growth

**입력값** (페이지별 라벨만 다르게 처리)

| 페이지 | Previous | Current |
|--------|----------|---------|
| MoM | Previous Month Value | Current Month Value |
| YoY | Previous Year Value | Current Year Value |
| QoQ | Previous Quarter Value | Current Quarter Value |
| WoW | Previous Week Value | Current Week Value |

**출력값**

- Growth Rate
- Difference
- Multiplier
- Direction
- Summary Sentence

**Summary Sentence 예시**

```
Current month is up 25% from the previous month.
Current year is down 12.5% from the previous year.
```

**Related Tools**

- Growth Rate Calculator
- Percentage Change Calculator
- CAGR Calculator
- Growth Projection Calculator

---

### Group C. Growth Planning Series

**탭 메뉴 있음**

- Goal Growth
- Required Growth
- Reverse Growth

**페이지 목록**

| Path | H1 | 목적 |
|------|----|------|
| `/goal-growth-calculator` | Goal Growth Calculator | 현재값에서 목표값까지 필요한 성장률 계산 |
| `/required-growth-calculator` | Required Growth Calculator | 목표 달성을 위해 필요한 증가량/성장률 계산 |
| `/reverse-growth-calculator` | Reverse Growth Calculator | 최종값과 성장률로 시작값 역산 |

**필수 키워드**

- goal growth calculator
- required growth calculator
- reverse growth calculator
- target growth calculator
- growth target calculator

#### 5-1. Goal Growth Calculator

입력값: Current Value, Target Value

출력값: Required Growth Rate, Required Difference, Multiplier Needed, Formula

```
Required Growth Rate = (Target - Current) / Current × 100
```

#### 5-2. Required Growth Calculator

입력값: Current Value, Target Value

출력값: Required Increase, Required Growth Rate, Remaining Gap, Progress to Target

```
Progress to Target = Current / Target × 100
Remaining Gap      = Target - Current
```

#### 5-3. Reverse Growth Calculator

입력값: Final Value, Growth Rate

출력값: Original Value, Difference, Multiplier, Formula

```
Original Value = Final Value / (1 + Growth Rate / 100)
```

**Related Tools**

- Growth Rate Calculator
- Percentage Change Calculator
- CAGR Calculator
- Compound Growth Calculator

---

### Group D. Compound Growth Series

**탭 메뉴 있음**

- CAGR
- Compound Growth
- Growth Projection

**페이지 목록**

| Path | H1 | 목적 |
|------|----|------|
| `/cagr-calculator` | CAGR Calculator | 시작값·종료값·기간으로 연평균 성장률 계산 |
| `/compound-growth-calculator` | Compound Growth Calculator | 시작값·성장률·기간으로 최종값 계산 |
| `/growth-projection-calculator` | Growth Projection Calculator | 현재값 기준 미래 성장값 예측 |

**필수 키워드**

- CAGR calculator
- compound growth calculator
- growth projection calculator
- annual growth rate calculator
- future value calculator

#### 6-1. CAGR Calculator

입력값: Start Value, End Value, Number of Years

출력값: CAGR, Total Growth, Final Multiplier, Formula

```
CAGR = (End / Start) ^ (1 / Years) - 1
```

#### 6-2. Compound Growth Calculator

입력값: Initial Value, Growth Rate, Number of Periods

출력값: Final Value, Total Growth, Total Difference, Formula

```
Final Value = Initial Value × (1 + Growth Rate / 100) ^ Periods
```

#### 6-3. Growth Projection Calculator

입력값: Current Value, Growth Rate, Number of Periods

출력값: Projected Value, Total Growth, Total Difference, Formula

**Related Tools**

- Growth Rate Calculator
- Goal Growth Calculator
- MoM Growth Calculator
- Percentage Change Calculator

---

## 7. 탭 메뉴 구성 규칙

- 같은 그룹 내부만 탭으로 노출
- 다른 그룹은 Related Tools로 노출
- 탭과 Related Tools는 중복하지 않는다

**예: `/growth-rate-calculator` 탭**

Growth Rate / Percentage Change / Increase / Decrease / Percent Difference

**예: `/cagr-calculator` 탭**

CAGR / Compound Growth / Projection

---

## 8. 공통 UI 요구사항

**기본 레이아웃 (위→아래 순)**

1. PageHead
2. Calculator Tabs
3. Calculator Card
4. Result Card
5. Formula
6. Quick Examples
7. FAQ
8. Related Tools

**입력**

- 숫자 입력
- 쉼표 입력 허용
- 음수 허용
- 소수 허용
- 빈 값일 경우 결과 미노출 또는 placeholder 표시

**출력 포맷 예시**

```
25%
+250
1.25×
Increase
```

**소수점**

- 최대 4자리
- 불필요한 0 제거

**Copy 기능**

각 결과값 옆에 Copy 버튼 제공

---

## 9. 공통 Validation

| 조건 | 처리 |
|------|------|
| Start Value = 0 (percentage change) | 계산 불가 |
| Years ≤ 0 | 불가 |
| Periods = 0 | 허용 |
| NaN / Infinity | 미노출 |

**오류 문구 예시**

```
Start value cannot be zero for percentage change.
Years must be greater than zero.
Please enter valid numbers.
```

---

## 10. Quick Examples

각 페이지별 3개 제공.

**Growth Rate 예시**

```
100 → 125 = +25%
1,200 → 1,860 = +55%
80 → 60 = -25%
```

**CAGR 예시**

```
100 → 200 over 5 years
1,000 → 1,500 over 3 years
10,000 → 25,000 over 10 years
```

---

## 11. FAQ 공통 방향

각 페이지 최소 3개.

**Percentage Change 계열 예시**

- What is growth rate?
- How do you calculate percentage change?
- Can the result be negative?

**CAGR 페이지 예시**

- What does CAGR mean?
- How is CAGR different from total growth?
- Can CAGR be negative?

---

## 12. 구현 방식

각 route page는 config만 주입한다.

```tsx
<GrowthCalculatorPage mode="growth-rate" />
```

**mode 타입**

```ts
type GrowthCalculatorMode =
  | "growth-rate"
  | "percentage-change"
  | "percentage-increase"
  | "percentage-decrease"
  | "percent-difference"
  | "mom-growth"
  | "yoy-growth"
  | "qoq-growth"
  | "wow-growth"
  | "goal-growth"
  | "required-growth"
  | "reverse-growth"
  | "cagr"
  | "compound-growth"
  | "growth-projection";
```

---

## 13. 구현 우선순위

1. `growthMath.ts`: 계산 로직
2. `calculatorConfig.ts`: 전체 페이지 설정
3. `GrowthCalculator` 공통 UI
4. Group A 페이지 생성
5. Group B 페이지 생성
6. Group C 페이지 생성
7. Group D 페이지 생성
8. FAQ / Related Tools / JSON-LD 연결
9. 모바일 QA
10. 계산 엣지케이스 QA

---

## 14. 핵심 판단

| 연결 유형 | 방법 |
|-----------|------|
| 같은 계산군 | 탭 메뉴 |
| 다른 계산군 | Related Tools |
| 각 검색 의도 | 개별 URL |
| 계산 로직 | 공통 엔진 |

이 방식이 KitFolio의 SEO 확장성과 구현 효율을 둘 다 잡는다.
