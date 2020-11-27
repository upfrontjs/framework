export {};
// import { DaysInMonth, MonthNames, ShiftNumbers, WeekDays } from '../Constants/Enums';
//
//
// export type Variables = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond' | 'tz';
//
// export default class AbstractDateTime {
//     protected value = {
//         year: 0,
//         month: 1,
//         day: 1,
//         hour: 0,
//         minute: 0,
//         second: 0,
//         millisecond: 0,
//         tz: 'utc'
//     };
//
//     set year(value: number) {
//         this.value.year = value < 0 ? 0 : value;
//     }
//
//     get year(): number {
//         return this.value.year;
//     }
//
//     set month(month: number) {
//         let years = 0;
//
//         if (month > ShiftNumbers.MONTHS_PER_YEAR) {
//             years += Math.floor(month / ShiftNumbers.MONTHS_PER_YEAR);
//             month = month % ShiftNumbers.MONTHS_PER_YEAR;
//         }
//
//         if (this.value.month + month > ShiftNumbers.MONTHS_PER_YEAR) {
//             years++;
//             month = ShiftNumbers.MONTHS_PER_YEAR - (this.value.month + month);
//         }
//
//         this.year += years;
//         this.value.month = month;
//     }
//
//     get month(): number {
//         return this.value.month;
//     }
//
//     get monthName(): string {
//         return MonthNames[this.value.month - 1];
//     }
//
//     get shortMonthName(): string {
//         return this.monthName.slice(0, 3);
//     }
//
//     set day(day: number) {
//         let daysInMonth = this.daysInMonth();
//
//         while (this.value.day + day > daysInMonth) {
//             this.month++;
//             day = daysInMonth - this.value.day;
//             daysInMonth = this.daysInMonth();
//         }
//
//         this.value.day += day;
//     }
//
//     get day(): number {
//         return this.value.day;
//     }
//
//     set hour(hour: number) {
//         while (this.value.hour + hour > ShiftNumbers.HOURS_PER_DAY) {
//             this.day++;
//             hour = ShiftNumbers.HOURS_PER_DAY - this.value.hour;
//         }
//
//         this.value.hour = hour;
//     }
//
//     get hour(): number {
//         return this.value.hour;
//     }
//
//     set minute(minute: number) {
//         while (this.value.minute + minute > ShiftNumbers.MINUTES_PER_HOUR) {
//             this.hour++;
//             minute = ShiftNumbers.MINUTES_PER_HOUR - this.value.minute;
//         }
//
//         this.value.minute = minute;
//     }
//
//     get second(): number {
//         return this.value.second;
//     }
//
//     set second(second: number) {
//         while (this.value.second + second > ShiftNumbers.SECONDS_PER_MINUTE) {
//             this.minute++;
//             second = ShiftNumbers.MINUTES_PER_HOUR - this.value.second;
//         }
//
//         this.value.second = second;
//     }
//
//     get millisecond(): number {
//         return this.value.millisecond;
//     }
//
//     set millisecond(millisecond: number) {
//         while (this.value.millisecond + millisecond > ShiftNumbers.MILLISECONDS_PER_SECOND) {
//             this.minute++;
//             millisecond = ShiftNumbers.MINUTES_PER_HOUR - this.value.millisecond;
//         }
//
//         this.value.millisecond = millisecond;
//     }
//
//     static isLeapYear(year: number): boolean {
//         return new Date(year, 1, 29).getDate() === 29;
//     }
//
//     public isLeapYear(): boolean {
//         return AbstractDateTime.isLeapYear(this.value.year);
//     }
//
//     public daysInMonth(): number {
//         if (this.monthName === 'February' && this.isLeapYear()) {
//             return DaysInMonth[this.monthName.toUpperCase()] + 1;
//         }
//
//         return DaysInMonth[this.monthName.toUpperCase()];
//     }
//
//     constructor(...params: any[]) {
//         AbstractDateTime.parse(params ?? new Date());
//     }
//
//     static parse(...value: any[]): AbstractDateTime {
//         const date = new Date(...value);
//
//         const dateTime = new this();
//
//         dateTime.value = {
//             year: date.getFullYear(),
//             month: date.getMonth(),
//             day: date.getDay(),
//             hour: date.getHours(),
//             minute: date.getMinutes(),
//             second: date.getSeconds(),
//             millisecond: date.getMilliseconds(),
//             tz: Intl.DateTimeFormat().resolvedOptions().timeZone // todo pass explicit
//         };
//
//         return dateTime;
//     }
//
//     format(format: string): string;
//
//     week(value: number|undefined): number|AbstractDateTime;
//     weekDay(value: number|undefined): number|AbstractDateTime;
//
//     toDateString(separator: string): string {
//
//     }
//     toFormattedDateString(): string;
//     toTimeString():string;
//     toDateTimeString(): string;
//     toDayDateTimeString(): string
//     toISOString(): string {
//         return new Date().toISOString();
//     }
//
//     toString(): string {
//         return this.toDateTimeString();
//     }
//
//     lastWeekDay(): AbstractDateTime;
//     firstWeekDay(): AbstractDateTime;
//
//     endOfDay(): AbstractDateTime;
//     startOfDay(): AbstractDateTime;
//     endOfWeek(): AbstractDateTime;
//     startOfWeek(): AbstractDateTime;
//     endOfMonth(): AbstractDateTime;
//     startOfMonth(): AbstractDateTime;
//     endOfYear(): AbstractDateTime;
//     startOfYear(): AbstractDateTime;
//     endOfDecade(): AbstractDateTime;
//     startOfDecade(): AbstractDateTime;
//     endOfCentury(): AbstractDateTime;
//     startOfCentury(): AbstractDateTime;
//
//     is(value: string): boolean
//     isSet(type: string): boolean;
//     equalsTo(value: unknown): boolean;
//     notEqualsTo(value: unknown): boolean;
//     greaterThan(value: unknown): boolean;
//     greaterThanOrEqualTo(value: unknown): boolean;
//     lessThan(value: unknown): boolean;
//     lessThanOrEqualTo(value: unknown): boolean;
//     isBetween(start: unknown, end: unknown): boolean;// hmm include/exclude?
//     isDateTimeInstance(value: unknown): value is AbstractDateTime;
//     isFuture(value: unknown): boolean;
//     isPast(value: unknown): boolean;
//     isSameYear(value: unknown): boolean;
//     isCurrentYear(value: unknown): boolean;
//     isNextYear(value: unknown): boolean;
//     isCurrentYear(value: unknown): boolean;
//     isCurrentQuarter(value: unknown, regardlessOfYear: boolean): boolean;
//     isNextQuarter(value: unknown): boolean;
//     isLastQuarter(value: unknown): boolean;
//     isSameMonth(value: unknown): boolean;
//     isNextMonth(value: unknown): boolean;
//     isLastMonth(value: unknown): boolean;
//
//     isWeekDay(value: unknown): boolean;
//     isWeekend(value: unknown): boolean;
//     isMonday(value: unknown): boolean;
//     isTuesday(value: unknown): boolean;
//     isWednesday(value: unknown): boolean;
//     isThursday(value: unknown): boolean;
//     isFriday(value: unknown): boolean;
//     isSaturday(value: unknown): boolean;
//     isSunday(value: unknown): boolean;
//     isLastOfMonth(value: unknown): boolean;
//     // more assertions to come
//
//     subDay(): AbstractDateTime;
//     subDays(count: number): AbstractDateTime;
//     addDay(): AbstractDateTime;
//     addDays(count: number): AbstractDateTime;
//
//     diffInMinutes(value: unknown): number;
//     diffInHours(value: unknown): number;
//     diffinDays(value: unknown): number;
//     diffForHumans(value: unknown): string;
//
//     // todo interval/period
// }
