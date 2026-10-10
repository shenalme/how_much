import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { compareDates, countWeekdays, formatDateLong, type YMD } from '../../../utils/dates';

export const calculator: CalculatorDefinition = {
  slug: 'days-between-dates-calculator',
  intro:
    'Choose a start and end date to count the days between them, and see how many are weekdays.',
  fields: [
    {
      id: 'start',
      kind: 'date',
      label: 'Start date',
      help: 'Defaults to today.',
      default: 'today',
    },
    { id: 'end', kind: 'date', label: 'End date', default: '2026-12-25' },
    {
      id: 'inclusive',
      kind: 'select',
      label: 'Include the end date?',
      options: [
        { value: 'no', label: 'No (count the days in between)' },
        { value: 'yes', label: 'Yes (count both start and end dates)' },
      ],
      default: 'no',
      wide: true,
    },
  ],
  calculate(inputs) {
    let start: YMD = inputs.date('start');
    let end: YMD = inputs.date('end');
    const reversed = compareDates(start, end) > 0;
    if (reversed) [start, end] = [end, start];
    const inclusive = inputs.select('inclusive') === 'yes';
    const { weekdays, weekendDays, total } = countWeekdays(start, end, inclusive);

    return {
      headline: { value: formatNumber(total, 0), unit: plural(total, 'day') },
      summary: `There ${total === 1 ? 'is' : 'are'} ${formatNumber(total, 0)} ${plural(total, 'day')} from ${formatDateLong(start)} to ${formatDateLong(end)}${inclusive ? ', counting both dates' : ''}.`,
      details: [
        { label: 'Weekdays (Mon–Fri)', value: formatNumber(weekdays, 0) },
        { label: 'Weekend days (Sat–Sun)', value: formatNumber(weekendDays, 0) },
        {
          label: 'Weeks',
          value: `${formatNumber(Math.floor(total / 7), 0)} weeks and ${total % 7} ${plural(total % 7, 'day')}`,
        },
      ],
      notes: [
        ...(reversed ? ['The end date is before the start date, so the dates were swapped.'] : []),
        'Public holidays are not excluded from the weekday count.',
      ],
    };
  },
  content: {
    howItWorks: [
      'The calculator counts calendar days from the start date up to the end date. By default the start date counts and the end date doesn’t, which is how most durations and countdowns work: from today to tomorrow is 1 day.',
      'Weekdays are Monday to Friday. Whole weeks contribute 5 weekdays each, and the remaining days are checked individually. Public holidays vary by country and region, so they are not subtracted.',
    ],
    formula: [
      { label: 'Days', expression: 'Days = End date − Start date (+ 1 if both dates count)' },
      {
        label: 'Weekdays',
        expression: 'Weekdays = 5 × whole weeks + weekdays in the remaining days',
      },
    ],
    examples: [
      {
        title: 'From 1 December to 25 December 2026',
        values: { start: '2026-12-01', end: '2026-12-25', inclusive: 'no' },
        steps: [
          '25 − 1 = 24 days',
          '3 whole weeks = 21 days with 15 weekdays',
          'The remaining 3 days (Tue 22 to Thu 24 December) are all weekdays: 18 weekdays in total',
        ],
        expected: '24',
      },
    ],
    faq: [
      {
        question: 'How do I count business days?',
        answer:
          'Use the weekday count, then subtract any public holidays that fall on weekdays in your location.',
      },
      {
        question: 'Does the calculator handle leap years?',
        answer: 'Yes. It counts real calendar days, including 29 February in leap years.',
      },
      {
        question: 'Why might my count be one day different from another tool?',
        answer:
          'Tools differ on whether they count the end date. Switch “include the end date” to match the convention you need.',
      },
    ],
  },
};
