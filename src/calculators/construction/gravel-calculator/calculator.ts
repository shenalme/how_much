import type { CalculatorDefinition } from '../../types';
import { formatNumber } from '../../../utils/format';
import { fromBase } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea, SHORT_LENGTH_UNITS } from '../../shared/area';
import { volumeDetails, volumeHeadline } from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'gravel-calculator',
  intro:
    'Enter the area and depth of your driveway, path or base layer to estimate the volume and weight of gravel to order.',
  fields: [
    ...areaFields({ noun: 'area', length: '20', width: '10' }),
    {
      id: 'depth',
      kind: 'unit',
      label: 'Depth',
      help: 'Paths are often 2–3 in (5–8 cm); driveways usually 4 in (10 cm) or more.',
      dimension: 'length',
      units: SHORT_LENGTH_UNITS,
      defaultUnit: 'in',
      default: '4',
      exclusiveMin: true,
      max: 1000,
    },
    {
      id: 'density',
      kind: 'unit',
      label: 'Gravel density',
      help: 'Dry gravel and crushed stone are typically 90–110 lb/ft³ (about 1,450–1,750 kg/m³). Your supplier can confirm.',
      dimension: 'density',
      units: ['lbft3', 'kgm3', 'tonyd3', 'tm3'],
      defaultUnit: 'lbft3',
      default: '100',
      exclusiveMin: true,
    },
    {
      id: 'extra',
      kind: 'select',
      label: 'Extra for compaction',
      help: 'Gravel compacts when rolled or driven on.',
      options: [
        { value: '0', label: 'None' },
        { value: '5', label: '5% extra' },
        { value: '10', label: '10% extra' },
        { value: '15', label: '15% extra' },
      ],
      default: '10',
    },
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const extra = Number(inputs.select('extra'));
    const volume = area * inputs.unit('depth') * (1 + extra / 100);
    const kg = volume * inputs.unit('density');
    const metric = measuredInMetric(inputs);
    const tons = fromBase(kg, 'ton');
    const tonnes = fromBase(kg, 't');
    const vol = volumeHeadline(volume, metric);
    const headline = metric
      ? { value: formatNumber(tonnes, 2), unit: 'tonnes' }
      : { value: formatNumber(tons, 2), unit: 'tons' };

    return {
      headline,
      summary: `You need approximately ${headline.value} ${headline.unit} (${vol.value} ${vol.unit}) of gravel${extra > 0 ? `, including ${extra}% for compaction` : ''}.`,
      details: [
        ...volumeDetails(volume).slice(0, 3),
        { label: 'US tons', value: formatNumber(tons, 2) },
        { label: 'Metric tonnes', value: formatNumber(tonnes, 2) },
        { label: 'Pounds', value: `${formatNumber(fromBase(kg, 'lb'), 0)} lb` },
      ],
      notes: [
        'Weight depends heavily on the stone type and moisture; ask your supplier for their figure.',
      ],
    };
  },
  content: {
    howItWorks: [
      'The volume of gravel is the area × the depth, plus an allowance for compaction. Gravel is often sold by weight, so the volume is multiplied by the material’s density to estimate tons or tonnes.',
      'Density varies with the type of stone, the size and shape of the pieces, and how wet it is, which is why the calculator lets you enter it. A US ton (short ton) is 2,000 lb; a metric tonne is 1,000 kg (about 2,205 lb).',
    ],
    formula: [
      { label: 'Volume', expression: 'Volume = Area × Depth × (1 + Extra % ÷ 100)' },
      { label: 'Weight', expression: 'Weight = Volume × Density' },
      { label: 'US tons', expression: 'Tons = Pounds ÷ 2,000' },
    ],
    assumptions: [
      'The default density of 100 lb/ft³ (about 1,600 kg/m³, or 1.35 US tons per cubic yard) is a mid-range figure for dry gravel. Ask your supplier for the density of the product you are buying.',
      'For driveways, a base layer of larger crushed stone is often laid under a finer top layer. Calculate each layer separately.',
    ],
    examples: [
      {
        title: 'A 20 × 10 ft path, 4 inches deep',
        values: {
          shape: 'rectangle',
          length: { value: '20', unit: 'ft' },
          width: { value: '10', unit: 'ft' },
          depth: { value: '4', unit: 'in' },
          density: { value: '100', unit: 'lbft3' },
          extra: '0',
        },
        steps: [
          'Volume = 20 × 10 × (4 ÷ 12) = 66.67 ft³ (2.47 yd³)',
          'Weight = 66.67 ft³ × 100 lb/ft³ = 6,667 lb',
          '6,667 lb ÷ 2,000 = 3.33 US tons',
        ],
        expected: '3.33',
      },
    ],
    faq: [
      {
        question: 'How much does a cubic yard of gravel weigh?',
        answer:
          'Typically about 1.2 to 1.5 US tons (roughly 2,400 to 3,000 lb), depending on the stone and moisture. At the default 100 lb/ft³ a cubic yard weighs 2,700 lb, or 1.35 tons.',
      },
      {
        question: 'How deep should gravel be for a driveway?',
        answer:
          'Driveways are commonly built in layers totalling around 4 to 8 inches or more, with larger stone at the bottom. The right depth depends on traffic and soil, so check local guidance.',
      },
      {
        question: 'How much area does a ton of gravel cover?',
        answer:
          'At 100 lb/ft³ and 2 inches deep, a US ton (2,000 lb = 20 ft³) covers about 120 square feet. At 4 inches deep it covers about 60 square feet.',
      },
    ],
  },
};
