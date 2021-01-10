// import { daysInMonth, monthNames, ShiftNumbers } from './Constants/Enums';
// import type DateTimeInterface from '../../Contracts/DateTimeInterface';

export type Variables = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond' | 'tz';

// export default class DateTime implements DateTimeInterface {
//     /**
//      * The internal value store.
//      *
//      * @protected
//      *
//      * @type {object}
//      */
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
//     /**
//      * The setter for the year.
//      *
//      * @param {number} value
//      */
//     public set year(value: number) {
//         this.value.year = value < 0 ? 0 : value;
//     }
//
//     /**
//      * The getter for the year.
//      *
//      * @type {number}
//      */
//     public get year(): number {
//         return this.value.year;
//     }
//
//     /**
//      * The setter for the month.
//      *
//      * @param {number} month
//      */
//     public set month(month: number) {
//         let years = 0;
//
//         if (month > ShiftNumbers.monthsPerYear) {
//             years += Math.floor(month / ShiftNumbers.monthsPerYear);
//             month = month % ShiftNumbers.monthsPerYear;
//         }
//
//         if (this.value.month + month > ShiftNumbers.monthsPerYear) {
//             years++;
//             month = ShiftNumbers.monthsPerYear - (this.value.month + month);
//         }
//
//         this.year += years;
//         this.value.month = month;
//     }
//
//     /**
//      * The getter for the month.
//      *
//      * @type {number}
//      */
//     public get month(): number {
//         return this.value.month;
//     }
//
//     /**
//      * Get the name of the current month.
//      *
//      * @type {string}
//      */
//     public get monthName(): string {
//         return (monthNames[this.value.month - 1] as string).ucFirst();
//     }
//
//     /**
//      * Get short name of the current month.
//      *
//      * @type {string}
//      */
//     public get shortMonthName(): string {
//         return this.monthName.slice(0, 3);
//     }
//
//     /**
//      * Get the name of the current month.
//      *
//      * @type {string}
//      */
//     public get dayName(): string {
//         const dayIndex = this.day % ShiftNumbers.daysPerWeek;
//         return (monthNames[this.value.month - 1] as string).ucFirst();
//     }
//
//     /**
//      * Get short name of the current month.
//      *
//      * @type {string}
//      */
//     public get shortDayName(): string {
//         return this.dayName.slice(0, 3);
//     }
//
//     /**
//      * The setter for the day.
//      *
//      * @param {number} day
//      */
//     public set day(day: number) {
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
//     /**
//      * The getter for the day.
//      *
//      * @return {number}
//      */
//     public get day(): number {
//         return this.value.day;
//     }
//
//     /**
//      * The setter for the hour.
//      *
//      * @param {number} hour
//      */
//     public set hour(hour: number) {
//         while (this.value.hour + hour > ShiftNumbers.hoursPerDay) {
//             this.day++;
//             hour = ShiftNumbers.hoursPerDay - this.value.hour;
//         }
//
//         this.value.hour = hour;
//     }
//
//     /**
//      * The getter for the hour.
//      *
//      * @type {number}
//      */
//     public get hour(): number {
//         return this.value.hour;
//     }
//
//     /**
//      * The getter for the minute.
//      *
//      * @param {number} minute
//      */
//     public set minute(minute: number) {
//         while (this.value.minute + minute > ShiftNumbers.minutesPerHour) {
//             this.hour++;
//             minute = ShiftNumbers.minutesPerHour - this.value.minute;
//         }
//
//         this.value.minute = minute;
//     }
//
//     /**
//      * The getter for the minute.
//      *
//      * @type {number}
//      */
//     public get second(): number {
//         return this.value.second;
//     }
//
//     public set second(second: number) {
//         while (this.value.second + second > ShiftNumbers.secondsPerMinute) {
//             this.minute++;
//             second = ShiftNumbers.minutesPerHour - this.value.second;
//         }
//
//         this.value.second = second;
//     }
//
//     /**
//      * The getter for the millisecond.
//      *
//      * @type {number}
//      */
//     public get millisecond(): number {
//         return this.value.millisecond;
//     }
//
//     /**
//      * The setter for the millisecond.
//      *
//      * @param {number} millisecond
//      */
//     public set millisecond(millisecond: number) {
//         while (this.value.millisecond + millisecond > ShiftNumbers.millisecondspersecond) {
//             this.minute++;
//             millisecond = ShiftNumbers.minutesPerHour - this.value.millisecond;
//         }
//
//         this.value.millisecond = millisecond;
//     }
//
//     /**
//      * The consturctor.
//      *
//      * @param {...any} params
//      */
//     constructor(...params: any[]) {
//         this.parse(params);
//     }
//
//     /**
//      * Parse the given arguments using the built in date.
//      *
//      * @param {...any} value
//      *
//      * @return {this}
//      */
//     public parse(...value: any[]): DateTime {
//         // @ts-expect-error
//         const date = new Date(...value);
//
//         this.value = {
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
//         return this;
//     }
//
//     format(format: string): string;
//
//     week(value: number|undefined): number|DateTime;
//     weekDay(value: number|undefined): number|DateTime;
//
//     toDateString(separator: string): string {
//
//     }
//     toFormattedDateString(): string;
//     toTimeString(): string;
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
//     lastWeekDay(): DateTime;
//     firstWeekDay(): DateTime {}
//
//     /**
//      * Set the date time to the start of the second.
//      *
//      * @return {this}
//      */
//     public startOfSecond(): this {
//         this.millisecond = 0;
//         return this;
//     }
//
//     /**
//      * Set the date time to the end of the second.
//      *
//      * @return {this}
//      */
//     public endOfSecond(): this {
//         this.millisecond = ShiftNumbers.millisecondspersecond;
//         return this;
//     }
//
//     /**
//      * Set the date time to the start of the minute.
//      *
//      * @return {this}
//      */
//     public startOfMinute(): this {
//         this.second = 0;
//         return this.startOfSecond();
//     }
//
//     /**
//      * Set the date time to the end of the minute.
//      *
//      * @return {this}
//      */
//     public endOfMinute(): this {
//         this.second = ShiftNumbers.secondsPerMinute;
//         return this.endOfSecond();
//     }
//
//     /**
//      * Set the date time to the start of the hour.
//      *
//      * @return {this}
//      */
//     public startOfHour(): this {
//         this.minute = 0;
//         return this.startOfMinute();
//     }
//
//     /**
//      * Set the date time to the end of the hour.
//      *
//      * @return {this}
//      */
//     public endOfHour(): this {
//         this.minute = ShiftNumbers.minutesPerHour;
//         return this.endOfMinute();
//     }
//
//     /**
//      * Set the date time to the start of the day.
//      *
//      * @return {this}
//      */
//     public startOfDay(): this {
//         this.hour = 0;
//         return this.startOfHour();
//     }
//
//     /**
//      * Set the date time to the end of the day.
//      *
//      * @return {this}
//      */
//     public endOfDay(): this {
//         this.hour = ShiftNumbers.hoursPerDay;
//         return this.endOfHour();
//     }
//
//     /**
//      * Set the date time to the start of the week.
//      *
//      * @return {this}
//      */
//     public startOfWeek(): this {
//         this.day = 1;
//         return this.startOfDay();
//     }
//
//     /**
//      * Set the date time to the end of the week.
//      *
//      * @return {this}
//      */
//     public endOfWeek(): this {
//         this.day = ShiftNumbers.daysPerWeek;
//         return this.endOfDay();
//     }
//
//     /**
//      * Set the date time to the start of the week.
//      *
//      * @return {this}
//      */
//     public startOfMonth(): this {
//         this.day = 1;
//         return this.startOfWeek();
//     }
//
//     /**
//      * Set the date time to the end of the week.
//      *
//      * @return {this}
//      */
//     public endOfMonth(): this {
//         this.day = daysInMonth[this.monthName.toLowerCase()] as number;
//         return this.endOfWeek();
//     }
//
//
//     public endOfDecade(): DateTime;
//     public startOfDecade(): DateTime;
//     public endOfCentury(): DateTime;
//     public startOfCentury(): DateTime;
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
//     isDateTimeInstance(value: unknown): value is DateTime;
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
//
//     static isLeapYear(year: number): boolean {
//         return new Date(year, 1, 29).getDate() === 29;
//     }
//
//     public isLeapYear(): boolean {
//         return DateTime.isLeapYear(this.value.year);
//     }
//
//     public daysInMonth(): number {
//         if (this.monthName === 'February' && this.isLeapYear()) {
//             return daysInMonth[this.monthName.toUpperCase()] + 1;
//         }
//
//         return daysInMonth[this.monthName.toUpperCase()];
//     }
//     // more assertions to come
//
//     public subMillisecond(): DateTime;
//     public subMilliseconds(count: number): DateTime;
//     public addMillisecond(): DateTime;
//     public addMilliseconds(count: number): DateTime;
//     public subSecond(): DateTime;
//     public subSeconds(count: number): DateTime;
//     public addSecond(): DateTime;
//     public addSeconds(count: number): DateTime;
//     public subMinute(): DateTime;
//     public subMinutes(count: number): DateTime;
//     public addMinute(): DateTime;
//     public addMinutes(count: number): DateTime;
//     public subHour(): DateTime;
//     public subHours(count: number): DateTime;
//     public addHour(): DateTime;
//     public addHours(count: number): DateTime;
//     public subDay(): DateTime;
//     public subDays(count: number): DateTime;
//     public addDay(): DateTime;
//     public addDays(count: number): DateTime;
//     public subWeek(): DateTime;
//     public subWeeks(count: number): DateTime;
//     public addWeek(): DateTime;
//     public addWeeks(count: number): DateTime;
//     public subMonth(): DateTime;
//     public subMonths(count: number): DateTime;
//     public addMonth(): DateTime;
//     public addMonths(count: number): DateTime;
//     public subYear(): DateTime;
//     public subYears(count: number): DateTime;
//     public addYear(): DateTime;
//     public addYears(count: number): DateTime;
//
//     diffInMinutes(value: unknown): number;
//     diffInHours(value: unknown): number;
//     diffinDays(value: unknown): number;
//     diffForHumans(value: unknown): string;
//
//     // todo interval/period
// }
export default {};
