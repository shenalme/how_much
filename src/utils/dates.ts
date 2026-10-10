/**
 * Calendar-date arithmetic on plain year/month/day values.
 *
 * Everything works on whole calendar days in the proleptic Gregorian calendar
 * using UTC internally, so time zones and daylight saving never shift a count.
 */
export interface YMD {
  year: number;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
}

const MS_PER_DAY = 86_400_000;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** Parse "YYYY-MM-DD". Returns null for malformed or impossible dates (e.g. 2023-02-29). */
export function parseISODate(text: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function toISODate({ year, month, day }: YMD): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Days since 1970-01-01 (can be negative). */
export function toDayNumber({ year, month, day }: YMD): number {
  const date = new Date(0);
  // setUTCFullYear (unlike Date.UTC) does not map years 0–99 to the 1900s.
  date.setUTCFullYear(year, month - 1, day);
  return Math.round(date.getTime() / MS_PER_DAY);
}

export function fromDayNumber(dayNumber: number): YMD {
  const date = new Date(dayNumber * MS_PER_DAY);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function diffDays(from: YMD, to: YMD): number {
  return toDayNumber(to) - toDayNumber(from);
}

export function addDays(date: YMD, days: number): YMD {
  return fromDayNumber(toDayNumber(date) + days);
}

/**
 * Add calendar months. If the target month is shorter, the day is clamped to its
 * last day (Jan 31 + 1 month → Feb 28 or 29).
 */
export function addMonths(date: YMD, months: number): YMD {
  const index = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

export function compareDates(a: YMD, b: YMD): number {
  return toDayNumber(a) - toDayNumber(b);
}

/**
 * Difference in whole years, months and remaining days, the way people state ages.
 * Requires from <= to. A birthday on Feb 29 is treated as Feb 28 in common years.
 */
export function diffYMD(from: YMD, to: YMD): { years: number; months: number; days: number } {
  if (compareDates(from, to) > 0) throw new Error('diffYMD requires from <= to');
  let totalMonths = (to.year - from.year) * 12 + (to.month - from.month);
  const anniversaryDay = Math.min(from.day, daysInMonth(to.year, to.month));
  if (to.day < anniversaryDay) totalMonths -= 1;
  const anchor = addMonths(from, totalMonths);
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: diffDays(anchor, to),
  };
}

/** Total whole calendar months between two dates (from <= to). */
export function diffWholeMonths(from: YMD, to: YMD): number {
  const { years, months } = diffYMD(from, to);
  return years * 12 + months;
}

/** 0 = Sunday … 6 = Saturday */
export function dayOfWeek(date: YMD): number {
  return (((toDayNumber(date) + 4) % 7) + 7) % 7; // 1970-01-01 was a Thursday
}

/**
 * Count weekdays (Mon–Fri) and weekend days in the half-open range [from, to).
 * Pass `inclusive` to also count `to`. Requires from <= to.
 */
export function countWeekdays(
  from: YMD,
  to: YMD,
  inclusive = false,
): { weekdays: number; weekendDays: number; total: number } {
  const start = toDayNumber(from);
  const end = toDayNumber(to) + (inclusive ? 1 : 0);
  const total = Math.max(0, end - start);
  const fullWeeks = Math.floor(total / 7);
  let weekdays = fullWeeks * 5;
  const remainder = total % 7;
  const startDow = dayOfWeek(from);
  for (let i = 0; i < remainder; i += 1) {
    const dow = (startDow + i) % 7;
    if (dow !== 0 && dow !== 6) weekdays += 1;
  }
  return { weekdays, weekendDays: total - weekdays, total };
}

const longFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const mediumFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

function toUTCDate(date: YMD): Date {
  return new Date(toDayNumber(date) * MS_PER_DAY);
}

/** "Saturday, October 10, 2026" */
export function formatDateLong(date: YMD): string {
  return longFormatter.format(toUTCDate(date));
}

/** "October 10, 2026" */
export function formatDate(date: YMD): string {
  return mediumFormatter.format(toUTCDate(date));
}

/** The visitor's local calendar date as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return toISODate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}
