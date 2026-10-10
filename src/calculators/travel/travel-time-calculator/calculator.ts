import type { CalculatorDefinition } from '../../types';
import { formatDuration, formatNumber } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';

export const calculator: CalculatorDefinition = {
  slug: 'travel-time-calculator',
  intro:
    'Enter the distance and your expected average speed to estimate how long the journey will take, including breaks.',
  fields: [
    {
      id: 'distance',
      kind: 'unit',
      label: 'Distance',
      dimension: 'length',
      units: ['mi', 'km'],
      defaultUnit: 'mi',
      default: '270',
      exclusiveMin: true,
    },
    {
      id: 'speed',
      kind: 'unit',
      label: 'Average speed',
      help: 'Include towns and traffic: often well below the speed limit.',
      dimension: 'speed',
      units: ['mph', 'kmh'],
      defaultUnit: 'mph',
      default: '60',
      exclusiveMin: true,
      max: 1000,
    },
    {
      id: 'stops',
      kind: 'number',
      label: 'Number of stops',
      default: '1',
      integer: true,
      max: 100,
    },
    {
      id: 'stopMinutes',
      kind: 'number',
      label: 'Minutes per stop',
      default: '15',
      suffix: 'min',
      max: 1440,
    },
  ],
  calculate(inputs) {
    const meters = inputs.unit('distance');
    const metersPerSecond = inputs.unit('speed');
    const drivingHours = meters / metersPerSecond / 3600;
    const breakHours = (inputs.num('stops') * inputs.num('stopMinutes')) / 60;
    const total = drivingHours + breakHours;
    const metric = isMetric(inputs.unitOf('distance'));
    const distanceText = metric
      ? `${formatNumber(meters / 1000, 1)} km`
      : `${formatNumber(fromBase(meters, 'mi'), 1)} miles`;
    const duration = formatDuration(total);

    return {
      headline: { value: duration },
      summary: `${distanceText} will take about ${duration}${breakHours > 0 ? `, including ${formatDuration(breakHours)} of stops` : ''}.`,
      details: [
        { label: 'Driving time', value: formatDuration(drivingHours) },
        { label: 'Stops', value: formatDuration(breakHours) },
        { label: 'Total in hours', value: `${formatNumber(total, 2)} h` },
      ],
    };
  },
  content: {
    howItWorks: [
      'Time equals distance divided by speed. The calculator converts both to consistent units, divides, and adds the time you plan to spend at stops.',
      'The hardest part is choosing a realistic average speed. On highways it is usually somewhat below the speed limit, and on mixed routes with towns, traffic lights and congestion it can be much lower.',
    ],
    formula: [
      { label: 'Driving time', expression: 'Time = Distance ÷ Average speed' },
      { label: 'Total', expression: 'Total = Driving time + Stops × Minutes per stop' },
    ],
    assumptions: [
      'A constant average speed for the whole journey. Traffic, roadworks and weather can change journey times significantly.',
    ],
    examples: [
      {
        title: '270 miles at 60 mph with one 15 minute stop',
        values: {
          distance: { value: '270', unit: 'mi' },
          speed: { value: '60', unit: 'mph' },
          stops: '1',
          stopMinutes: '15',
        },
        steps: [
          'Driving = 270 ÷ 60 = 4.5 h = 4 h 30 min',
          'Total = 4 h 30 min + 15 min = 4 h 45 min',
        ],
        expected: '4 h 45 min',
      },
    ],
    faq: [
      {
        question: 'How often should I stop on a long drive?',
        answer:
          'Road safety organisations commonly recommend a break of at least 15 minutes about every two hours, and more often if you feel tired.',
      },
      {
        question: 'How do I convert decimal hours to hours and minutes?',
        answer: 'Multiply the decimal part by 60. 3.4 hours is 3 hours and 0.4 × 60 = 24 minutes.',
      },
      {
        question: 'What average speed should I use?',
        answer:
          'Use your past trips as a guide: divide a previous journey’s distance by the time it took, excluding stops.',
      },
    ],
  },
};
