import { createConverter } from '../../shared/converter';
import { formatSignificant } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'celsius-to-fahrenheit',
  from: 'c',
  to: 'f',
  defaultValue: '180',
  allowNegative: true,
  intro:
    'Enter a temperature in degrees Celsius to convert it to Fahrenheit, for weather, cooking or oven settings.',
  howItWorks: [
    'A Celsius degree is 9/5 the size of a Fahrenheit degree, and 0 °C is 32 °F. To convert, multiply by 9/5 (1.8) and add 32.',
    'Water freezes at 0 °C (32 °F) and boils at 100 °C (212 °F) at sea level.',
  ],
  formula: [
    { label: 'Conversion', expression: '°F = °C × 9 ÷ 5 + 32' },
    { label: 'Kelvin', expression: 'K = °C + 273.15' },
  ],
  tableValues: [-40, -18, 0, 10, 20, 25, 37, 100, 150, 160, 180, 190, 200, 220, 230],
  extraDetails: (c) => [{ label: 'Kelvin', value: `${formatSignificant(c + 273.15, 6)} K` }],
  examples: [
    {
      title: 'Convert an oven temperature of 180 °C',
      values: { value: '180' },
      steps: ['180 × 9 ÷ 5 = 324', '324 + 32 = 356 °F, commonly set as 350 °F'],
      expected: '356',
    },
  ],
  faq: [
    {
      question: 'What is 180 °C in Fahrenheit?',
      answer: '356 °F. Recipes usually round this to 350 °F.',
    },
    {
      question: 'What temperature is the same in Celsius and Fahrenheit?',
      answer: '−40. At −40 degrees the two scales read the same.',
    },
    {
      question: 'Is there a quick way to estimate Fahrenheit from Celsius?',
      answer: 'Double it and add 30. 20 °C → 40 → 70 °F (the exact answer is 68 °F).',
    },
  ],
});
