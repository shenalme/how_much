import { CalcInputError } from '../../engine';
import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { addDays, compareDates, diffDays, formatDate } from '../../../utils/dates';

export const calculator: CalculatorDefinition = {
  slug: 'age-in-days-calculator',
  intro:
    'Enter your date of birth to see how many days you have been alive, and when you will reach your next round-number milestone.',
  fields: [
    { id: 'birth', kind: 'date', label: 'Date of birth', default: '1990-05-15' },
    { id: 'on', kind: 'date', label: 'Count to', help: 'Defaults to today.', default: 'today' },
  ],
  calculate(inputs) {
    const birth = inputs.date('birth');
    const on = inputs.date('on');
    if (compareDates(birth, on) > 0) {
      throw new CalcInputError('The date of birth is after the “count to” date.', 'birth');
    }
    const days = diffDays(birth, on);
    const nextThousand = (Math.floor(days / 1000) + 1) * 1000;
    const nextTenThousand = (Math.floor(days / 10000) + 1) * 10000;
    const milestone = (n: number) => {
      const date = addDays(birth, n);
      const remaining = n - days;
      return `${formatDate(date)} (in ${formatNumber(remaining, 0)} ${plural(remaining, 'day')})`;
    };

    return {
      headline: { value: formatNumber(days, 0), unit: plural(days, 'day old', 'days old') },
      summary: `You are ${formatNumber(days, 0)} ${plural(days, 'day')} old.`,
      details: [
        {
          label: 'Weeks',
          value: `${formatNumber(Math.floor(days / 7), 0)} weeks and ${days % 7} ${plural(days % 7, 'day')}`,
        },
        { label: 'Hours (approx.)', value: formatNumber(days * 24, 0) },
        { label: `${formatNumber(nextThousand, 0)} days old on`, value: milestone(nextThousand) },
        ...(nextTenThousand !== nextThousand
          ? [
              {
                label: `${formatNumber(nextTenThousand, 0)} days old on`,
                value: milestone(nextTenThousand),
              },
            ]
          : []),
      ],
      notes: ['Counts whole calendar days, without the time of day you were born.'],
    };
  },
  content: {
    howItWorks: [
      'The calculator counts every calendar day from your date of birth up to the chosen date, including leap days. It works on dates only, so your time of birth and time zone don’t affect the count.',
      'Milestones are found by adding a round number of days to your birth date: the next multiple of 1,000, and the next multiple of 10,000. Some people celebrate their 10,000th day, which falls at about 27 years and 4½ months.',
    ],
    formula: [
      { label: 'Age in days', expression: 'Days = Count-to date − Date of birth' },
      { label: 'Weeks', expression: 'Weeks = Days ÷ 7' },
      { label: 'Milestone date', expression: 'Milestone date = Date of birth + N days' },
    ],
    examples: [
      {
        title: 'Born 15 May 1990, counted to 10 October 2026',
        values: { birth: '1990-05-15', on: '2026-10-10' },
        steps: [
          '15 May 1990 to 15 May 2026 is 36 years, containing 9 leap days: 36 × 365 + 9 = 13,149 days',
          '15 May 2026 to 10 October 2026 is 148 days',
          'Total = 13,149 + 148 = 13,297 days',
        ],
        expected: '13,297',
      },
    ],
    faq: [
      {
        question: 'When will I be 10,000 days old?',
        answer:
          'About 27 years and 4½ months after you were born; the exact date depends on how many leap days fall in between. Enter your birth date to see it.',
      },
      {
        question: 'Does the count include the day I was born?',
        answer:
          'The count is the number of days that have passed since your birth date, so on your date of birth you are 0 days old and the next day you are 1 day old.',
      },
      {
        question: 'How many days old is someone who just turned 18?',
        answer:
          '6,574 or 6,575 days, depending on whether four or five leap days fell in those 18 years.',
      },
    ],
  },
};
