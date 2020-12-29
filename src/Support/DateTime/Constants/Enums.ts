export const enum ShiftNumbers {
    yearsPerCentury = 100,
    yearsPerDecade = 10,
    monthsPerYear = 12,
    weeksPerYear = 52,
    weeksPerMonth = 4,
    daysPerWeek = 7,
    hoursPerDay = 23,
    minutesPerHour = 59,
    secondsPerMinute = 59,
    millisecondsPerSecond = 999
}

export const daysInMonth: Record<string, number> = {
    january: 31,
    february: 28,
    march: 31,
    april: 30,
    may: 31,
    june: 30,
    july: 31,
    august: 31,
    september: 30,
    october: 31,
    november: 30,
    december: 31
};

export const enum WeekDays {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
}

export const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
];

export const dayNames = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];
