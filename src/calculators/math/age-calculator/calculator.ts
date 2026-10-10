import { CalcInputError } from '../../engine';
import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import {
  compareDates,
  dayOfWeek,
  daysInMonth,
  diffDays,
  diffYMD,
  formatDate,
  type YMD,
} from '../../../utils/dates';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The next birthday on or after `on`. Feb 29 birthdays fall on Feb 28 in common years. */
export function nextBirthday(birth: YMD, on: YMD): YMD {
  for (const year of [on.year, on.year + 1]) {
    const candidate = {
      year,
      month: birth.month,
      day: Math.min(birth.day, daysInMonth(year, birth.month)),
    };
    if (compareDates(candidate, on) >= 0) return candidate;
  }
  return { year: on.year + 1, month: birth.month, day: birth.day };
}

export function ageParts(years: number, months: number, days: number): string {
  return `${formatNumber(years, 0)} ${plural(years, 'year')}, ${months} ${plural(months, 'month')} and ${days} ${plural(days, 'day')}`;
}

export const calculator: CalculatorDefinition = {
  slug: 'age-calculator',
  intro:
    'Enter a date of birth to get an exact age in years, months and days. Change the second date to find someone’s age on any day.',
  fields: [
    { id: 'birth', kind: 'date', label: 'Date of birth', default: '1990-05-15' },
    { id: 'on', kind: 'date', label: 'Age on', help: 'Defaults to today.', default: 'today' },
  ],
  calculate(inputs) {
    const birth = inputs.date('birth');
    const on = inputs.date('on');
    if (compareDates(birth, on) > 0) {
      throw new CalcInputError('The date of birth is after the “age on” date.', 'birth');
    }
    const { years, months, days } = diffYMD(birth, on);
    const totalDays = diffDays(birth, on);
    const next = nextBirthday(birth, on);
    const untilNext = diffDays(on, next);

    return {
      headline: { value: formatNumber(years, 0), unit: plural(years, 'year old', 'years old') },
      summary: `The age is ${ageParts(years, months, days)}.`,
      details: [
        { label: 'Total months', value: formatNumber(years * 12 + months, 0) },
        {
          label: 'Total weeks',
          value: `${formatNumber(Math.floor(totalDays / 7), 0)} weeks and ${totalDays % 7} ${plural(totalDays % 7, 'day')}`,
        },
        { label: 'Total days', value: formatNumber(totalDays, 0) },
        { label: 'Born on a', value: WEEKDAYS[dayOfWeek(birth)] ?? '' },
        {
          label: 'Next birthday',
          value:
            untilNext === 0
              ? 'Today!'
              : `${formatDate(next)}, in ${formatNumber(untilNext, 0)} ${plural(untilNext, 'day')}`,
        },
      ],
    };
  },
  content: {
    howItWorks: [
      'Age is counted in completed years, then completed months, then the remaining days, exactly as you would count on a calendar. A month is counted when the same day number comes round again; if that month is shorter (for example, someone born on the 31st), the last day of the month is used.',
      'The totals in weeks and days count every calendar day between the two dates. The calculation uses dates only, so the time of day and time zones do not affect the result.',
    ],
    formula: [
      {
        label: 'Years and months',
        expression: 'Whole months from birth date to target date, then split into years and months',
      },
      { label: 'Days', expression: 'Days = target date − (birth date + whole months)' },
      { label: 'Total days', expression: 'Total days = number of calendar days between the dates' },
    ],
    assumptions: [
      'People born on 29 February are treated as having their birthday on 28 February in common years. Some countries use 1 March for legal purposes.',
    ],
    examples: [
      {
        title: 'Born 15 May 1990, age on 10 October 2026',
        values: { birth: '1990-05-15', on: '2026-10-10' },
        steps: [
          'From 15 May 1990 to 15 May 2026 is 36 years',
          'From 15 May 2026 to 15 September 2026 is 4 months',
          'From 15 September to 10 October is 25 days',
        ],
        expected: '36',
      },
    ],
    faq: [
      {
        question: 'How is age calculated for someone born on 29 February?',
        answer:
          'This calculator counts their birthday as 28 February in years without a 29 February. Legal conventions vary, and some countries use 1 March.',
      },
      {
        question: 'How do I find someone’s age on a past or future date?',
        answer:
          'Change the “Age on” date. For example, enter a wedding or graduation date to see how old someone was or will be on that day.',
      },
      {
        question: 'Does the calculator count leap days?',
        answer: 'Yes. Total days count every calendar day, including 29 February in leap years.',
      },
    ],
  },
};
