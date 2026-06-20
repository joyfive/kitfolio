declare module "lunar-javascript" {
  class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getWeekInChinese(): string;
    getLunar(): Lunar;
  }

  class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    /** Negative value = intercalation (leap) month */
    getMonth(): number;
    getDay(): number;
    getSolar(): Solar;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearShengXiao(): string;
  }

  export { Solar, Lunar };
}
