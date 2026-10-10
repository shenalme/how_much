import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import {
  addDays,
  compareDates,
  diffDays,
  diffYMD,
  formatDate,
  type YMD,
} from '../../../utils/dates';

export function describeDifference(
  years: number,
  months: number,
  days: number,
): { value: string; unit: string } {
  const parts: string[] = [];
  if (years > 0) parts.push(`${formatNumber(years, 0)} ${plural(years, 'year')}`);
  if (months > 0) parts.push(`${months} ${plural(months, 'month')}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${plural(days, 'day')}`);
  const [first = '0 days', ...rest] = parts;
  const [value = '0', ...unitWords] = first.split(' ');
  const unit = [unitWords.join(' '), ...rest].join(', ');
  return { value, unit };
}

export const calculator: CalculatorDefinition = {
  slug: 'date-difference-calculator',
  intro:
    'Pick two dates to see how far apart they are in years, months and days, plus the total number of days, weeks and months.',
  fields: [
    { id: 'start', kind: 'date', label: 'Start date', default: '2026-01-01' },
    { id: 'end', kind: 'date', label: 'End date', help: 'Defaults to today.', default: 'today' },
    {
      id: 'inclusive',
      kind: 'select',
      label: 'Include the end date?',
      help: 'Choose yes to count both the first and last day, e.g. for a booking or event.',
      options: [
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Yes, add 1 day' },
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
    if (inputs.select('inclusive') === 'yes') end = addDays(end, 1);
    const { years, months, days } = diffYMD(start, end);
    const totalDays = diffDays(start, end);
    const headline = describeDifference(years, months, days);

    return {
      headline,
      summary: `${headline.value} ${headline.unit} between ${formatDate(start)} and ${formatDate(inputs.date(reversed ? 'start' : 'end'))}.`,
      details: [
        { label: 'Total days', value: formatNumber(totalDays, 0) },
        {
          label: 'Total weeks',
          value: `${formatNumber(Math.floor(totalDays / 7), 0)} weeks and ${totalDays % 7} ${plural(totalDays % 7, 'day')}`,
        },
        { label: 'Total whole months', value: formatNumber(years * 12 + months, 0) },
        { label: 'Total hours', value: formatNumber(totalDays * 24, 0) },
      ],
      notes: reversed
        ? ['The end date is before the start date, so the dates were swapped.']
        : undefined,
    };
  },
  content: {
    howItWorks: [
      'The difference is counted the way you would on a calendar: first whole years, then whole months, then the days left over. A month is complete when the same day number comes round again; when a month is too short (for example, from 31 January), its last day is used.',
      'Total days counts every calendar day between the dates. By default the start date is counted and the end date is not, so from Monday to Tuesday is 1 day. Choose “include the end date” to count both.',
    ],
    formula: [
      {
        label: 'Years, months, days',
        expression: 'Count whole years, then whole months, then remaining days',
      },
      { label: 'Total days', expression: 'Total days = End date − Start date (+ 1 if inclusive)' },
    ],
    examples: [
      {
        title: 'From 1 January 2026 to 10 October 2026',
        values: { start: '2026-01-01', end: '2026-10-10', inclusive: 'no' },
        steps: [
          '1 January to 1 October is 9 whole months',
          '1 October to 10 October is 9 days',
          'Total days = 282',
        ],
        expected: '9',
      },
    ],
    faq: [
      {
        question: 'Why are months not counted as 30 days?',
        answer:
          'Months really are different lengths, so counting calendar months gives the answer people expect: 15 March to 15 April is one month even though it is 31 days.',
      },
      {
        question: 'Should I include the end date?',
        answer:
          'For durations (how long something lasted) usually not. For bookings, events and leave where both the first and last days count, include it.',
      },
      {
        question: 'Can I count working days?',
        answer:
          'Use the Days Between Dates Calculator, which shows weekdays and weekend days separately.',
      },
    ],
  },
};
