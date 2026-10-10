import type { CalculatorDefinition } from '../../types';
import { formatNumber } from '../../../utils/format';
import { fromBase } from '../../../utils/units';
import { areaFields, measuredInMetric, readArea } from '../../shared/area';

/** Typical new-lawn seeding rates in lb per 1,000 ft² (midpoint of the commonly quoted range). */
export const GRASS_RATES: Record<string, { label: string; range: string; rate: number }> = {
  'kentucky-bluegrass': { label: 'Kentucky bluegrass', range: '2–3', rate: 2.5 },
  'tall-fescue': { label: 'Tall fescue', range: '6–8', rate: 7 },
  'perennial-ryegrass': { label: 'Perennial ryegrass', range: '7–9', rate: 8 },
  'fine-fescue': { label: 'Fine fescue', range: '3–5', rate: 4 },
  bermudagrass: { label: 'Bermudagrass (hulled)', range: '1–2', rate: 1.5 },
};

/** 1 lb per 1,000 ft² expressed in g/m². */
const LB_PER_1000FT2_IN_G_PER_M2 = 453.59237 / 92.90304;

export const calculator: CalculatorDefinition = {
  slug: 'grass-seed-calculator',
  intro:
    'Estimate how much seed to buy for a new lawn or for overseeding an existing one. Pick your grass type, or enter the rate printed on your seed bag.',
  fields: [
    ...areaFields({
      noun: 'lawn',
      shapes: ['area', 'rectangle', 'circle'],
      area: '5000',
      length: '50',
      width: '40',
    }),
    {
      id: 'grass',
      kind: 'select',
      label: 'Grass type',
      options: [
        ...Object.entries(GRASS_RATES).map(([value, g]) => ({
          value,
          label: `${g.label} (${g.range} lb per 1,000 ft²)`,
        })),
        { value: 'custom', label: 'Use the rate on my seed bag' },
      ],
      default: 'tall-fescue',
      wide: true,
    },
    {
      id: 'rate',
      kind: 'number',
      label: 'Seeding rate for a new lawn',
      default: '5',
      exclusiveMin: true,
      max: 1000,
      showWhen: { field: 'grass', equals: ['custom'] },
    },
    {
      id: 'rateUnit',
      kind: 'select',
      label: 'Rate unit',
      options: [
        { value: 'lb1000', label: 'lb per 1,000 ft²' },
        { value: 'gm2', label: 'g per m²' },
      ],
      default: 'lb1000',
      showWhen: { field: 'grass', equals: ['custom'] },
    },
    {
      id: 'project',
      kind: 'select',
      label: 'Project',
      options: [
        { value: 'new', label: 'New lawn (bare soil)' },
        { value: 'overseed', label: 'Overseeding an existing lawn' },
      ],
      default: 'new',
      wide: true,
    },
  ],
  calculate(inputs) {
    const area = readArea(inputs);
    const grass = inputs.select('grass');
    const preset = GRASS_RATES[grass];
    let rateLb: number;
    if (preset) {
      rateLb = preset.rate;
    } else {
      const entered = inputs.num('rate');
      rateLb = inputs.select('rateUnit') === 'gm2' ? entered / LB_PER_1000FT2_IN_G_PER_M2 : entered;
    }
    const overseed = inputs.select('project') === 'overseed';
    const appliedRate = overseed ? rateLb / 2 : rateLb;
    const ft2 = fromBase(area, 'ft2');
    const pounds = (ft2 / 1000) * appliedRate;
    const kilograms = pounds * 0.45359237;
    const metric = measuredInMetric(inputs);
    const headline = metric
      ? { value: formatNumber(kilograms, 2), unit: 'kg' }
      : { value: formatNumber(pounds, 2), unit: 'lb' };
    const other = metric ? `${formatNumber(pounds, 2)} lb` : `${formatNumber(kilograms, 2)} kg`;

    return {
      headline,
      summary: `You need about ${headline.value} ${headline.unit} (${other}) of seed.`,
      details: [
        { label: 'Lawn area', value: `${formatNumber(ft2, 0)} ft² (${formatNumber(area, 1)} m²)` },
        {
          label: 'Rate used',
          value: `${formatNumber(appliedRate, 2)} lb per 1,000 ft² (${formatNumber(appliedRate * LB_PER_1000FT2_IN_G_PER_M2, 1)} g/m²)`,
        },
        { label: 'Pounds', value: `${formatNumber(pounds, 2)} lb` },
        { label: 'Kilograms', value: `${formatNumber(kilograms, 2)} kg` },
      ],
      notes: [
        overseed
          ? 'Overseeding uses half the new-lawn rate, a common rule of thumb. Follow your seed label if it differs.'
          : 'Rates vary between seed blends. If your seed label gives a rate, choose “Use the rate on my seed bag”.',
      ],
    };
  },
  content: {
    howItWorks: [
      'Seeding rates are quoted as weight of seed per area, usually pounds per 1,000 square feet in the US or grams per square meter elsewhere. The calculator converts your lawn area to square feet, divides by 1,000 and multiplies by the rate.',
      'Grass species have very different seed sizes. Kentucky bluegrass seed is tiny, so a little covers a lot of ground, while tall fescue and ryegrass seeds are much larger and need several times the weight. For overseeding an established lawn, the calculator uses half of the new-lawn rate.',
    ],
    formula: [
      {
        label: 'Seed needed',
        expression: 'Seed (lb) = Area (ft²) ÷ 1,000 × Rate (lb per 1,000 ft²)',
      },
      { label: 'Overseeding', expression: 'Rate = New-lawn rate ÷ 2' },
      { label: 'Metric rate', expression: '1 lb per 1,000 ft² = 4.88 g/m²' },
    ],
    assumptions: [
      'Preset rates are the midpoints of ranges commonly printed on seed labels and in lawn guides. Your seed bag is the best source for the rate of a particular product or blend.',
      'Coated seed weighs more than bare seed, so coated products usually need a higher rate by weight.',
      'Halving the rate for overseeding is a rule of thumb; thin or damaged lawns may need more.',
    ],
    tables: [
      {
        caption: 'Typical seeding rates used by this calculator',
        columns: ['Grass type', 'New lawn (lb per 1,000 ft²)', 'Overseeding (lb per 1,000 ft²)'],
        rows: Object.values(GRASS_RATES).map((g) => [
          g.label,
          formatNumber(g.rate, 2),
          formatNumber(g.rate / 2, 2),
        ]),
      },
    ],
    examples: [
      {
        title: 'A new 5,000 ft² tall fescue lawn',
        values: {
          shape: 'area',
          area: { value: '5000', unit: 'ft2' },
          grass: 'tall-fescue',
          project: 'new',
        },
        steps: ['Rate = 7 lb per 1,000 ft²', 'Seed = 5,000 ÷ 1,000 × 7 = 35 lb'],
        expected: '35',
      },
    ],
    faq: [
      {
        question: 'How much grass seed do I need per 1,000 square feet?',
        answer:
          'It depends on the species: roughly 2 to 3 lb for Kentucky bluegrass, 6 to 8 lb for tall fescue and 7 to 9 lb for perennial ryegrass when starting a new lawn. Always check the rate on the bag.',
      },
      {
        question: 'Can I put down extra seed to get a thicker lawn?',
        answer:
          'Seeding far above the recommended rate makes seedlings compete for light, water and nutrients, which can leave a weaker lawn. Stick close to the label rate and focus on good seed-to-soil contact and watering.',
      },
      {
        question: 'How much seed do I need to overseed?',
        answer:
          'A common rule of thumb is about half the new-lawn rate. For tall fescue that is around 3 to 4 lb per 1,000 square feet.',
      },
    ],
  },
};
