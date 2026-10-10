import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatMoney, formatNumber } from '../../../utils/format';
import { fromBase } from '../../../utils/units';
import { economyFromLitersPerKm, economySummary } from '../../shared/fuel';

export const calculator: CalculatorDefinition = {
  slug: 'mpg-calculator',
  intro:
    'Fill the tank, note the trip distance at the next fill-up and how much fuel it took, then enter both here to find your real fuel economy.',
  fields: [
    {
      id: 'distance',
      kind: 'unit',
      label: 'Distance driven',
      dimension: 'length',
      units: ['mi', 'km'],
      defaultUnit: 'mi',
      default: '350',
      exclusiveMin: true,
    },
    {
      id: 'fuel',
      kind: 'unit',
      label: 'Fuel used',
      help: 'The amount it took to fill the tank back up.',
      dimension: 'volume',
      units: ['galUS', 'galUK', 'l'],
      defaultUnit: 'galUS',
      default: '11.2',
      exclusiveMin: true,
    },
    {
      id: 'price',
      kind: 'number',
      label: 'Price per unit of fuel',
      help: 'Optional, per the same unit as fuel used.',
      default: '',
      optional: true,
      max: 100000,
    },
  ],
  calculate(inputs) {
    const km = inputs.unit('distance') / 1000;
    const liters = fromBase(inputs.unit('fuel'), 'l');
    const lpk = liters / km;
    const economy = economyFromLitersPerKm(lpk);
    const fuelUnit = inputs.unitOf('fuel');
    const headline =
      fuelUnit === 'l'
        ? { value: formatNumber(economy.l100km, 1), unit: 'L/100 km' }
        : fuelUnit === 'galUK'
          ? { value: formatNumber(economy.mpgUK, 1), unit: 'mpg (UK)' }
          : { value: formatNumber(economy.mpgUS, 1), unit: 'mpg (US)' };

    const details: ResultDetail[] = economySummary(lpk);
    const price = inputs.optionalNum('price');
    if (price !== null) {
      const cost = price * inputs.num('fuel');
      const miles = fromBase(km * 1000, 'mi');
      details.push(
        { label: 'Fuel cost for this distance', value: formatMoney(cost) },
        { label: 'Cost per mile', value: formatMoney(cost / miles) },
        { label: 'Cost per km', value: formatMoney(cost / km) },
      );
    }

    return {
      headline,
      summary: `Your fuel economy is ${headline.value} ${headline.unit}.`,
      details,
    };
  },
  content: {
    howItWorks: [
      'Fuel economy is distance divided by fuel used (miles per gallon, kilometers per liter), or fuel used per distance (liters per 100 km). The calculator works out all of them from the same two numbers.',
      'The most accurate way to measure is the fill-up method: fill the tank, reset the trip meter, drive normally, then refill and divide the distance by the fuel it took to refill.',
    ],
    formula: [
      { label: 'Miles per gallon', expression: 'mpg = Miles driven ÷ Gallons used' },
      {
        label: 'Liters per 100 km',
        expression: 'L/100 km = Liters used ÷ Kilometers driven × 100',
      },
      { label: 'Converting', expression: 'mpg (US) = 235.215 ÷ L/100 km' },
    ],
    assumptions: ['US gallon = 3.785411784 L and UK gallon = 4.54609 L.'],
    examples: [
      {
        title: '350 miles on 11.2 US gallons',
        values: { distance: { value: '350', unit: 'mi' }, fuel: { value: '11.2', unit: 'galUS' } },
        steps: ['mpg = 350 ÷ 11.2 = 31.25', 'Shown to one decimal place: 31.3 mpg (US)'],
        expected: '31.3',
      },
      {
        title: '520 km on 36.4 liters',
        values: { distance: { value: '520', unit: 'km' }, fuel: { value: '36.4', unit: 'l' } },
        steps: ['L/100 km = 36.4 ÷ 520 × 100 = 7.0'],
        expected: '7',
      },
    ],
    faq: [
      {
        question: 'Is a higher or lower L/100 km better?',
        answer:
          'Lower. L/100 km measures fuel used per distance, so a smaller number means a more efficient vehicle. With mpg, higher is better.',
      },
      {
        question: 'Why doesn’t my mpg match the official figure?',
        answer:
          'Official tests use standard conditions. Real driving with traffic, higher speeds, short trips, cold weather, roof racks or heavy loads usually uses more fuel.',
      },
      {
        question: 'How do I convert US mpg to UK mpg?',
        answer:
          'Multiply by about 1.20095, because a UK gallon is 4.54609 L and a US gallon is 3.785411784 L.',
      },
    ],
  },
};
