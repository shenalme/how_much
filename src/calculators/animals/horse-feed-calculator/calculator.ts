import type { CalculatorDefinition, ResultDetail } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { ceilCount } from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'horse-feed-calculator',
  intro:
    'Estimate daily hay for one or more horses from body weight, and how much to store for a month or a whole winter.',
  fields: [
    {
      id: 'weight',
      kind: 'unit',
      label: 'Body weight per horse',
      help: 'Many riding horses weigh 900–1,200 lb (400–550 kg).',
      dimension: 'mass',
      units: ['lb', 'kg'],
      defaultUnit: 'lb',
      default: '1100',
      exclusiveMin: true,
      max: 10000,
    },
    {
      id: 'intake',
      kind: 'number',
      label: 'Daily intake, % of body weight',
      help: 'Typically 1.5–2.5% (as dry matter). Use 2% if unsure.',
      default: '2',
      suffix: '%',
      exclusiveMin: true,
      max: 5,
    },
    {
      id: 'dryMatter',
      kind: 'number',
      label: 'Hay dry matter',
      help: 'Most hay is about 85–92% dry matter.',
      default: '90',
      suffix: '%',
      min: 50,
      max: 100,
    },
    {
      id: 'horses',
      kind: 'number',
      label: 'Number of horses',
      default: '1',
      integer: true,
      min: 1,
      max: 10000,
    },
    {
      id: 'days',
      kind: 'number',
      label: 'Number of days',
      default: '30',
      integer: true,
      min: 1,
      max: 3650,
    },
    {
      id: 'bale',
      kind: 'unit',
      label: 'Bale weight',
      help: 'Optional. Weigh a few bales: small squares vary widely.',
      dimension: 'mass',
      units: ['lb', 'kg'],
      defaultUnit: 'lb',
      default: '50',
      optional: true,
      exclusiveMin: true,
      max: 5000,
    },
  ],
  calculate(inputs) {
    const weightKg = inputs.unit('weight');
    const dryMatterKg = weightKg * (inputs.num('intake') / 100);
    const hayKg = dryMatterKg / (inputs.num('dryMatter') / 100);
    const horses = inputs.num('horses');
    const days = inputs.num('days');
    const totalKg = hayKg * horses * days;
    const metric = isMetric(inputs.unitOf('weight'));
    const mass = (kg: number, decimals = 1) =>
      metric
        ? `${formatNumber(kg, decimals)} kg`
        : `${formatNumber(fromBase(kg, 'lb'), decimals)} lb`;

    const details: ResultDetail[] = [
      { label: 'Dry matter per horse per day', value: mass(dryMatterKg) },
      { label: 'Hay per horse per day (as fed)', value: mass(hayKg) },
      { label: `All horses, per day`, value: mass(hayKg * horses) },
      { label: `All horses, ${formatNumber(days, 0)} days`, value: mass(totalKg, 0) },
      {
        label: 'Total in tons / tonnes',
        value: `${formatNumber(fromBase(totalKg, 'ton'), 2)} US tons (${formatNumber(fromBase(totalKg, 't'), 2)} t)`,
      },
    ];
    let balesText = '';
    const bale = inputs.optionalUnit('bale');
    if (bale !== null) {
      const bales = ceilCount(totalKg / bale);
      details.push({ label: 'Bales', value: formatNumber(bales, 0) });
      balesText = `, about ${formatNumber(bales, 0)} ${plural(bales, 'bale')}`;
    }

    const perDay = metric ? fromBase(hayKg, 'kg') : fromBase(hayKg, 'lb');
    return {
      headline: {
        value: formatNumber(perDay, 1),
        unit: metric ? 'kg of hay per horse per day' : 'lb of hay per horse per day',
      },
      summary: `Each horse needs about ${mass(hayKg)} of hay a day. ${formatNumber(horses, 0)} ${plural(horses, 'horse')} need about ${mass(totalKg, 0)} over ${formatNumber(days, 0)} days${balesText}.`,
      details,
      notes: [
        'Assumes the whole diet is hay. Reduce it for time on good pasture or for grain and concentrates.',
        'Add 10–20% for hay lost to wastage, especially when feeding on the ground.',
      ],
    };
  },
  content: {
    howItWorks: [
      'Horses generally eat about 1.5 to 2.5% of their body weight per day in dry matter, and equine nutrition guidelines recommend that forage makes up at least about 1% of body weight each day. The calculator multiplies body weight by the intake percentage to get daily dry matter.',
      'Hay contains some moisture, so it is divided by its dry-matter percentage to give the weight of hay as fed. That daily amount is multiplied by the number of horses and days, and divided by bale weight if you enter one.',
    ],
    formula: [
      { label: 'Dry matter', expression: 'Dry matter per day = Body weight × Intake % ÷ 100' },
      { label: 'Hay as fed', expression: 'Hay per day = Dry matter ÷ (Dry matter % ÷ 100)' },
      { label: 'Total', expression: 'Total = Hay per day × Horses × Days' },
      { label: 'Bales', expression: 'Bales = Total ÷ Bale weight, rounded up' },
    ],
    assumptions: [
      'Individual needs vary with age, workload, body condition, pregnancy or lactation, metabolism and the weather. Easy keepers may need less; hard keepers and horses in heavy work may need more or extra concentrate.',
      'Hay quality varies. Low-quality hay may not meet a horse’s nutrient needs even when fed in sufficient quantity.',
      'Make diet changes gradually, and ask your veterinarian or an equine nutritionist about your horse’s specific ration.',
    ],
    examples: [
      {
        title: 'A 1,100 lb horse for 30 days',
        values: {
          weight: { value: '1100', unit: 'lb' },
          intake: '2',
          dryMatter: '90',
          horses: '1',
          days: '30',
          bale: { value: '50', unit: 'lb' },
        },
        steps: [
          'Dry matter = 1,100 lb × 2% = 22 lb per day',
          'Hay as fed = 22 ÷ 0.90 = 24.4 lb per day',
          '30 days = 733 lb',
          '733 ÷ 50 lb bales = 14.7, rounded up to 15 bales',
        ],
        expected: '24.4',
      },
    ],
    faq: [
      {
        question: 'How much hay does a horse eat per day?',
        answer:
          'Roughly 1.5 to 2.5% of body weight. For an average 1,000 lb horse that is about 15 to 25 lb of hay a day when hay is the main feed.',
      },
      {
        question: 'How much hay do I need for winter?',
        answer:
          'Multiply daily hay by the number of days without useful grazing. A 1,000 lb horse eating 20 lb a day for 150 days needs about 3,000 lb (1.5 tons), plus an allowance for wastage.',
      },
      {
        question: 'Can I weigh my horse without a scale?',
        answer:
          'A weight tape around the girth gives a rough estimate. For accuracy, use a livestock scale or ask your veterinarian.',
      },
    ],
  },
};
