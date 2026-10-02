/* ============================================================
   연차 계산: 법정 연차 정책 데이터

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   일수·한도·적용 기준이 바뀌면 이 파일만 고칩니다.
   계산식(calculator.ts)과 화면(AnnualLeaveCalculator.tsx)은 손대지 않습니다.

   ── 근거 (2026-10-01 · 10-02 원문 대조) ──
   · 1년 80% 이상 출근 시 15일          : 근로기준법 제60조 제1항
   · 1년 미만·80% 미만 1개월 개근 시 1일 : 제60조 제2항
   · 1년차 사용분 차감 규정 삭제         : 구 제60조 제3항, 법률 제15108호
                                          (2017-11-28 공포 · 2018-05-29 시행)
                                          적용 대상은 2017-05-30 이후 입사자
                                          (고용노동부 2018-05 설명자료)
   · 매 2년 1일 가산 · 25일 한도         : 제60조 제4항
   · 1년 미만 연차 소멸                  : 최초 1년의 근로가 끝날 때까지 (2020-03-31 개정)
   · 주 15시간 미만 적용 제외            : 제18조 제3항
   · 상시 4명 이하 사업장 적용 제외       : 시행령 제7조 [별표 1]
   · 단시간 근로자 시간 단위 비례 · 1시간 미만은 1시간 : 시행령 [별표 2] 제4호 나목
   · 회계연도 비례 연차 15 × 근속일수 ÷ 365 : 고용노동부 2018-05 설명자료
   · 기간 계산                           : 민법 제160조

   2027-06-10 시행 개정(2026-06-09)으로 제60조 항 번호가 한 칸씩 밀리지만
   발생 일수 규칙은 그대로라 이 값은 바뀌지 않는다.
   개정되면 값을 덮어쓰지 말고 적용 기간을 나눠 기록합니다.
   ============================================================ */

export type AnnualLeavePolicy = {
  /** 1년 근로 시 기본 연차 (일) */
  baseDays: number;
  /** 최초 1년을 넘는 계속근로 몇 년마다 1일을 가산하는가 */
  bonusEveryYears: number;
  /** 가산 포함 총 연차 한도 (일) */
  maxDays: number;
  /** 1년 미만 월 단위 연차 최대 (일) */
  firstYearMonthlyMax: number;
  /** 출근율 기준 (%) */
  attendanceThresholdPct: number;
  /** 연차 적용 최소 주 소정근로시간 (미만이면 적용 제외) */
  minWeeklyHours: number;
  /** 단시간 근로자 시간 환산: 1일 = 8시간 */
  hoursPerDay: number;
  /** 통상 근로자 주 소정근로시간 기본값 */
  fullTimeWeeklyHours: number;
  /** 회계연도 비례 연차의 분모 (일) */
  proratedDenominator: number;
  /** 구 제3항(1년차 사용분 차감)이 적용되지 않는 첫 입사일 */
  noDeductionJoinFrom: string;
};

export const ANNUAL_LEAVE_POLICY: AnnualLeavePolicy = {
  baseDays: 15,
  bonusEveryYears: 2,
  maxDays: 25,
  firstYearMonthlyMax: 11,
  attendanceThresholdPct: 80,
  minWeeklyHours: 15,
  hoursPerDay: 8,
  fullTimeWeeklyHours: 40,
  proratedDenominator: 365,
  noDeductionJoinFrom: "2017-05-30",
};
