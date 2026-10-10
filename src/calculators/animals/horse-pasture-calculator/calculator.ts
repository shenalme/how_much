import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { convert, fromBase, isMetric } from '../../../utils/units';

/** Acres needed for `horses` under each guideline. */
export function acresNeeded(guideline: string, horses: number, customAcresPerHorse = 0): number {
  switch (guideline) {
    case 'first-plus':
      return horses <= 0 ? 0 : 2 + (horses - 1);
    case 'intensive':
      return horses * 1;
    case 'custom':
      return horses * customAcresPerHorse;
    default:
      return horses * 2;
  }
}

/** Largest whole number of horses that fit in `acres` under a guideline. */
export function horsesSupported(guideline: string, acres: number, customAcresPerHorse = 0): number {
  const per = guideline === 'intensive' ? 1 : guideline === 'custom' ? customAcresPerHorse : 2;
  if (guideline === 'first-plus') return acres < 2 ? 0 : Math.floor(acres - 2 + 1e-9) + 1;
  return per > 0 ? Math.floor(acres / per + 1e-9) : 0;
}

export const calculator: CalculatorDefinition = {
  slug: 'horse-pasture-calculator',
  intro:
    'Get a starting estimate of how much pasture your horses need, based on widely used rules of thumb. Real needs depend heavily on your climate, soil and management.',
  fields: [
    {
      id: 'horses',
      kind: 'number',
      label: 'Number of horses',
      default: '2',
      integer: true,
      min: 1,
      max: 10000,
    },
    {
      id: 'guideline',
      kind: 'select',
      label: 'Guideline',
      options: [
        { value: 'standard', label: '2 acres per horse (common rule of thumb)' },
        { value: 'first-plus', label: '2 acres for the first horse, 1 for each additional' },
        { value: 'intensive', label: '1 acre per horse (well-managed, productive pasture)' },
        { value: 'custom', label: 'My own figure' },
      ],
      default: 'standard',
      wide: true,
    },
    {
      id: 'perHorse',
      kind: 'unit',
      label: 'Land per horse',
      help: 'Your local extension office can suggest a figure for your area.',
      dimension: 'area',
      units: ['acre', 'ha'],
      defaultUnit: 'acre',
      default: '3',
      exclusiveMin: true,
      max: 100000,
      showWhen: { field: 'guideline', equals: ['custom'] },
    },
    {
      id: 'available',
      kind: 'unit',
      label: 'Land you have',
      help: 'Optional: see how many horses it supports under the same guideline.',
      dimension: 'area',
      units: ['acre', 'ha'],
      defaultUnit: 'acre',
      default: '',
      optional: true,
      exclusiveMin: true,
      max: 100000000,
    },
  ],
  calculate(inputs) {
    const horses = inputs.num('horses');
    const guideline = inputs.select('guideline');
    const customAcres = guideline === 'custom' ? fromBase(inputs.unit('perHorse'), 'acre') : 0;
    const acres = acresNeeded(guideline, horses, customAcres);
    const hectares = convert(acres, 'acre', 'ha');
    const metric =
      (guideline === 'custom' && isMetric(inputs.unitOf('perHorse'))) ||
      (inputs.has('available') && isMetric(inputs.unitOf('available')));

    const headline = metric
      ? { value: formatNumber(hectares, 2), unit: 'hectares' }
      : { value: formatNumber(acres, 2), unit: 'acres' };
    const other = metric ? `${formatNumber(acres, 2)} acres` : `${formatNumber(hectares, 2)} ha`;

    const details: ResultDetail[] = [
      { label: 'Acres', value: formatNumber(acres, 2) },
      { label: 'Hectares', value: formatNumber(hectares, 2) },
      { label: 'Square feet', value: formatNumber(convert(acres, 'acre', 'ft2'), 0) },
    ];
    const notes: string[] = [];
    const available = inputs.optionalUnit('available');
    if (available !== null) {
      const availableAcres = fromBase(available, 'acre');
      const supported = horsesSupported(guideline, availableAcres, customAcres);
      details.push({ label: 'Horses your land supports', value: formatNumber(supported, 0) });
      notes.push(
        supported >= horses
          ? `Your ${formatNumber(availableAcres, 2)} acres meets this guideline for ${formatNumber(horses, 0)} ${plural(horses, 'horse')}.`
          : `Your ${formatNumber(availableAcres, 2)} acres is ${formatNumber(acres - availableAcres, 2)} acres short of this guideline; expect to feed more hay and manage grazing closely.`,
      );
    }
    notes.push(
      'A rule of thumb, not a guarantee: dry climates and poor soils can need several times more land.',
    );

    return {
      headline,
      summary: `${formatNumber(horses, 0)} ${plural(horses, 'horse')} need roughly ${headline.value} ${headline.unit} (${other}) of pasture under this guideline.`,
      details,
      notes,
    };
  },
  content: {
    howItWorks: [
      'There is no single correct figure for how much land a horse needs. The calculator applies the guideline you choose. The most widely quoted rule of thumb is about 2 acres of pasture per horse; another common version allows 2 acres for the first horse and 1 more acre for each additional horse.',
      'Where pasture is highly productive and carefully managed (rotational grazing, fertilizing, weed control, a dry lot for wet weather) and the horses receive hay, around 1 acre per horse can work. Where forage is sparse, land needs rise sharply.',
    ],
    formula: [
      { label: '2 acres per horse', expression: 'Acres = Horses × 2' },
      { label: 'First horse plus', expression: 'Acres = 2 + (Horses − 1) × 1' },
      { label: 'Intensive', expression: 'Acres = Horses × 1' },
      { label: 'Hectares', expression: 'Hectares = Acres × 0.404686' },
    ],
    assumptions: [
      'Recommended acreage depends on climate, rainfall, soil fertility, forage species and quality, the size, age and workload of each horse, and how the pasture is managed. These guidelines assume reasonably productive pasture in a temperate climate.',
      'In arid regions or on poor soils, horses may need many times more land to get meaningful grazing, or their diet will come mostly from hay.',
      'Land for buildings, arenas, driveways and wooded areas does not count as grazing.',
      'For a figure for your property, contact your local agricultural extension office or an equine pasture specialist.',
    ],
    examples: [
      {
        title: 'Three horses at 2 acres each',
        values: { horses: '3', guideline: 'standard' },
        steps: ['Acres = 3 × 2 = 6 acres', '6 acres × 0.404686 = 2.43 hectares'],
        expected: '6',
      },
      {
        title: 'Three horses, first horse plus one acre each',
        values: { horses: '3', guideline: 'first-plus' },
        steps: ['Acres = 2 + (3 − 1) × 1 = 4 acres'],
        expected: '4',
      },
    ],
    faq: [
      {
        question: 'How many acres does a horse need?',
        answer:
          'A widely used rule of thumb is about 2 acres of good pasture per horse if pasture is to supply much of its diet. Well-managed, productive pasture with supplementary hay may support a horse on about 1 acre; dry or poor land can need far more.',
      },
      {
        question: 'Can I keep a horse on less than an acre?',
        answer:
          'Yes, many horses live on small acreages, but the land then serves mainly as turnout and exercise rather than food. Expect to feed most of the diet as hay and use a sacrifice area or dry lot to protect the grass.',
      },
      {
        question: 'What is a sacrifice area?',
        answer:
          'A small, durable turnout area where horses are kept when pasture is too wet, too short or recovering. It protects the rest of the land from overgrazing and mud damage.',
      },
    ],
  },
};
