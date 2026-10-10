import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatMoney, formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import {
  economyFields,
  fuelVolumeText,
  litersPerKm,
  priceFields,
  pricePerLiter,
  type EconomyUnit,
  type PriceUnit,
} from '../../shared/fuel';
import { ceilCount } from '../../shared/volume';

/** Refuelling stops needed, starting with a full tank and refilling to full each time. */
export function fuelStops(fuelNeeded: number, tankSize: number): number {
  return Math.max(0, ceilCount(fuelNeeded / tankSize) - 1);
}

export const calculator: CalculatorDefinition = {
  slug: 'road-trip-fuel-calculator',
  intro:
    'Estimate the fuel bill for a road trip, how to split it between passengers and how many fill-ups to plan for.',
  fields: [
    {
      id: 'distance',
      kind: 'unit',
      label: 'Trip distance',
      dimension: 'length',
      units: ['mi', 'km'],
      defaultUnit: 'mi',
      default: '600',
      exclusiveMin: true,
    },
    {
      id: 'trip',
      kind: 'select',
      label: 'Trip',
      options: [
        { value: 'one', label: 'One way' },
        { value: 'round', label: 'Round trip (double the distance)' },
      ],
      default: 'one',
    },
    ...economyFields('25'),
    ...priceFields('3.40'),
    {
      id: 'people',
      kind: 'number',
      label: 'People sharing the cost',
      default: '3',
      integer: true,
      min: 1,
      max: 100,
    },
    {
      id: 'tank',
      kind: 'unit',
      label: 'Fuel tank size',
      help: 'Optional, to estimate fill-ups. Check your owner’s manual.',
      dimension: 'volume',
      units: ['galUS', 'galUK', 'l'],
      defaultUnit: 'galUS',
      default: '14',
      optional: true,
      exclusiveMin: true,
    },
  ],
  calculate(inputs) {
    const multiplier = inputs.select('trip') === 'round' ? 2 : 1;
    const distanceKm = (inputs.unit('distance') / 1000) * multiplier;
    const lpk = litersPerKm(inputs.num('economy'), inputs.select('economyUnit') as EconomyUnit);
    const liters = distanceKm * lpk;
    const cost =
      liters * pricePerLiter(inputs.num('price'), inputs.select('priceUnit') as PriceUnit);
    const people = inputs.num('people');
    const metric = isMetric(inputs.unitOf('distance'));
    const distanceText = metric
      ? `${formatNumber(distanceKm, 0)} km`
      : `${formatNumber(fromBase(distanceKm * 1000, 'mi'), 0)} miles`;

    const details: ResultDetail[] = [
      { label: 'Distance', value: distanceText },
      { label: 'Fuel needed', value: fuelVolumeText(liters) },
      { label: `Cost per person (${formatNumber(people, 0)})`, value: formatMoney(cost / people) },
    ];
    const tank = inputs.optionalUnit('tank');
    if (tank !== null) {
      const stops = fuelStops(liters, fromBase(tank, 'l'));
      details.push({
        label: 'Fill-ups on the way',
        value: `${formatNumber(stops, 0)} (starting with a full tank)`,
      });
    }

    return {
      headline: { value: formatMoney(cost) },
      summary: `Fuel for ${distanceText} will cost about ${formatMoney(cost)}${people > 1 ? `, or ${formatMoney(cost / people)} for each of ${formatNumber(people, 0)} ${plural(people, 'person', 'people')}` : ''}.`,
      details,
      notes: [
        'Plan to refuel before the tank runs low; the fill-up count assumes you can use the whole tank.',
        'Speed, loaded luggage and roof boxes can raise fuel use on long trips.',
      ],
    };
  },
  content: {
    howItWorks: [
      'Total fuel is the trip distance divided by fuel economy (or multiplied by consumption for L/100 km). Multiplying by the price gives the fuel cost, which is then divided equally between the people sharing it.',
      'If you enter your tank size, the calculator also estimates how many times you will need to refuel on the way, assuming you set off with a full tank and refill it each time.',
    ],
    formula: [
      { label: 'Fuel', expression: 'Fuel = Distance ÷ Fuel economy' },
      { label: 'Cost', expression: 'Cost = Fuel × Price, Cost per person = Cost ÷ People' },
      { label: 'Fill-ups', expression: 'Fill-ups = ⌈Fuel ÷ Tank size⌉ − 1' },
    ],
    assumptions: [
      'Fuel economy and price are constant for the whole trip; prices often vary between regions.',
      'Tolls, parking, food and accommodation are not included.',
    ],
    examples: [
      {
        title: '600 miles, 25 mpg, 3.40 per gallon, 3 people',
        values: {
          distance: { value: '600', unit: 'mi' },
          trip: 'one',
          economy: '25',
          economyUnit: 'mpgUS',
          price: '3.40',
          priceUnit: 'perGalUS',
          people: '3',
          tank: { value: '14', unit: 'galUS' },
        },
        steps: [
          'Fuel = 600 ÷ 25 = 24 gallons',
          'Cost = 24 × 3.40 = 81.60, or 27.20 each',
          'Fill-ups = ⌈24 ÷ 14⌉ − 1 = 1',
        ],
        expected: '81.60',
      },
    ],
    faq: [
      {
        question: 'How should we split fuel costs on a road trip?',
        answer:
          'Splitting the fuel total equally between everyone is the simplest approach. Some groups also share tolls and parking, or give the driver a discount for the use of their car.',
      },
      {
        question: 'How far can I go on a tank of fuel?',
        answer:
          'Multiply your tank size by your fuel economy. A 14 gallon tank at 25 mpg gives about 350 miles, though it’s wise to refuel well before empty.',
      },
      {
        question: 'Does driving faster use more fuel?',
        answer:
          'Generally yes. Aerodynamic drag rises steeply with speed, so most cars use noticeably more fuel per mile at highway speeds above the most efficient range.',
      },
    ],
  },
};
