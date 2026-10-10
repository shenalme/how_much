import type { CalculatorDefinition } from '../../types';
import { formatMoney, formatNumber } from '../../../utils/format';
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

export function fuelCost(distanceKm: number, lpk: number, pricePerL: number) {
  const liters = distanceKm * lpk;
  return { liters, cost: liters * pricePerL };
}

export const calculator: CalculatorDefinition = {
  slug: 'fuel-cost-calculator',
  intro:
    'Enter the distance, your vehicle’s fuel economy and the fuel price to see how much a drive will cost.',
  fields: [
    {
      id: 'distance',
      kind: 'unit',
      label: 'Distance',
      dimension: 'length',
      units: ['mi', 'km'],
      defaultUnit: 'mi',
      default: '300',
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
    ...economyFields(),
    ...priceFields(),
  ],
  calculate(inputs) {
    const multiplier = inputs.select('trip') === 'round' ? 2 : 1;
    const distanceKm = (inputs.unit('distance') / 1000) * multiplier;
    const lpk = litersPerKm(inputs.num('economy'), inputs.select('economyUnit') as EconomyUnit);
    const perL = pricePerLiter(inputs.num('price'), inputs.select('priceUnit') as PriceUnit);
    const { liters, cost } = fuelCost(distanceKm, lpk, perL);
    const metric = isMetric(inputs.unitOf('distance'));
    const distanceText = metric
      ? `${formatNumber(distanceKm, 1)} km`
      : `${formatNumber(fromBase(distanceKm * 1000, 'mi'), 1)} miles`;
    const perDistance = metric
      ? `${formatMoney(cost / distanceKm)} per km`
      : `${formatMoney(cost / fromBase(distanceKm * 1000, 'mi'))} per mile`;

    return {
      headline: { value: formatMoney(cost) },
      summary: `Driving ${distanceText} will cost about ${formatMoney(cost)} in fuel.`,
      details: [
        { label: 'Distance', value: distanceText },
        { label: 'Fuel used', value: fuelVolumeText(liters) },
        { label: 'Cost per distance', value: perDistance },
      ],
      notes: ['Real consumption varies with speed, traffic, load, weather and terrain.'],
    };
  },
  content: {
    howItWorks: [
      'The fuel used is the distance divided by the fuel economy (or the distance × consumption for L/100 km). Multiplying the fuel used by the price per unit gives the cost.',
      'Fuel economy and prices are quoted in different units around the world, and US and UK gallons are different sizes (3.785 L and 4.546 L). The calculator converts everything to liters and kilometers internally, so you can mix units: a UK mpg figure with a price per liter, for example.',
    ],
    formula: [
      { label: 'With miles per gallon', expression: 'Fuel (gal) = Distance (mi) ÷ mpg' },
      { label: 'With L/100 km', expression: 'Fuel (L) = Distance (km) × L/100 km ÷ 100' },
      { label: 'Cost', expression: 'Cost = Fuel used × Price per unit' },
    ],
    assumptions: [
      'Uses a single average fuel economy for the whole trip.',
      'Tolls, parking and vehicle wear are not included.',
    ],
    examples: [
      {
        title: '300 miles at 30 mpg with fuel at 3.50 per US gallon',
        values: {
          distance: { value: '300', unit: 'mi' },
          trip: 'one',
          economy: '30',
          economyUnit: 'mpgUS',
          price: '3.50',
          priceUnit: 'perGalUS',
        },
        steps: ['Fuel = 300 ÷ 30 = 10 gallons', 'Cost = 10 × 3.50 = 35.00'],
        expected: '35.00',
      },
      {
        title: '450 km at 6.5 L/100 km with fuel at 1.75 per liter',
        values: {
          distance: { value: '450', unit: 'km' },
          trip: 'one',
          economy: '6.5',
          economyUnit: 'l100km',
          price: '1.75',
          priceUnit: 'perL',
        },
        steps: ['Fuel = 450 × 6.5 ÷ 100 = 29.25 L', 'Cost = 29.25 × 1.75 = 51.19'],
        expected: '51.19',
      },
    ],
    faq: [
      {
        question: 'How do I calculate the gas cost for a trip?',
        answer:
          'Divide the distance by your miles per gallon to get gallons, then multiply by the price per gallon.',
      },
      {
        question: 'Why are UK and US mpg figures different for the same car?',
        answer:
          'A UK (imperial) gallon is about 20% larger than a US gallon, so the same car gets a higher mpg figure in UK gallons. 30 mpg (US) is about 36 mpg (UK).',
      },
      {
        question: 'How do I convert L/100 km to mpg?',
        answer:
          'Divide 235.215 by the L/100 km figure for US mpg, or 282.481 for UK mpg. 8 L/100 km is about 29.4 mpg (US).',
      },
    ],
  },
};
