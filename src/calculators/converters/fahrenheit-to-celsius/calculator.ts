import { createConverter } from '../../shared/converter';
import { formatSignificant } from '../../../utils/format';

export const calculator = createConverter({
  slug: 'fahrenheit-to-celsius',
  from: 'f',
  to: 'c',
  defaultValue: '350',
  allowNegative: true,
  intro:
    'Enter a temperature in degrees Fahrenheit to convert it to Celsius, for weather, cooking or oven settings.',
  howItWorks: [
    'The Fahrenheit and Celsius scales have different zero points and different degree sizes. Water freezes at 32 °F (0 °C) and boils at 212 °F (100 °C) at sea level, so 180 Fahrenheit degrees span the same range as 100 Celsius degrees.',
    'To convert, subtract 32 and then multiply by 5/9. The two scales meet at −40, where −40 °F equals −40 °C.',
  ],
  formula: [
    { label: 'Conversion', expression: '°C = (°F − 32) × 5 ÷ 9' },
    { label: 'Kelvin', expression: 'K = °C + 273.15' },
  ],
  tableValues: [-40, 0, 32, 50, 68, 98.6, 212, 300, 325, 350, 375, 400, 425, 450],
  extraDetails: (f) => [
    { label: 'Kelvin', value: `${formatSignificant(((f - 32) * 5) / 9 + 273.15, 6)} K` },
  ],
  examples: [
    {
      title: 'Convert an oven temperature of 350 °F',
      values: { value: '350' },
      steps: [
        '350 − 32 = 318',
        '318 × 5 ÷ 9 = 176.667 °C, usually rounded to 175 or 180 °C on oven dials',
      ],
      expected: '176.667',
    },
  ],
  faq: [
    {
      question: 'What is 350 °F in Celsius?',
      answer:
        'About 176.7 °C. Recipes usually translate it as 180 °C, or 160 °C for fan (convection) ovens.',
    },
    {
      question: 'What is normal body temperature in Celsius?',
      answer:
        'The traditional figure of 98.6 °F is exactly 37 °C. Normal body temperature varies a little between people and through the day.',
    },
    {
      question: 'Is there a quick way to estimate Celsius from Fahrenheit?',
      answer:
        'Subtract 30 and halve. 70 °F → 40 → 20 °C (the exact answer is 21.1 °C). It is least accurate at extreme temperatures.',
    },
  ],
});
