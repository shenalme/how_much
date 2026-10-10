import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { fromBase, isMetric } from '../../../utils/units';
import { ceilCount } from '../../shared/volume';

export interface DeckInput {
  /** Deck length along the boards, metres. */
  lengthM: number;
  /** Deck width across the boards, metres. */
  widthM: number;
  boardWidthM: number;
  gapM: number;
  boardLengthM: number;
  joistSpacingM: number;
  wastePercent: number;
}

export function deckMaterials(input: DeckInput) {
  const rows = ceilCount(input.widthM / (input.boardWidthM + input.gapM));
  let boardsRaw: number;
  if (input.boardLengthM >= input.lengthM) {
    // Each board can be cut into one or more full-length pieces.
    const piecesPerBoard = Math.floor(input.boardLengthM / input.lengthM + 1e-9);
    boardsRaw = ceilCount(rows / piecesPerBoard);
  } else {
    boardsRaw = rows * ceilCount(input.lengthM / input.boardLengthM);
  }
  const boards = ceilCount(boardsRaw * (1 + input.wastePercent / 100));
  const joists = ceilCount(input.lengthM / input.joistSpacingM) + 1;
  const screws = rows * joists * 2;
  return { rows, boardsRaw, boards, joists, screws, linearM: rows * input.lengthM };
}

const len = (id: string, label: string, value: string, units: string[], help?: string) => ({
  id,
  kind: 'unit' as const,
  label,
  help,
  dimension: 'length' as const,
  units,
  defaultUnit: units[0] ?? 'ft',
  default: value,
  exclusiveMin: true,
});

export const calculator: CalculatorDefinition = {
  slug: 'deck-calculator',
  intro:
    'Enter the size of your deck and the boards you plan to use to estimate decking boards, joists and screws.',
  fields: [
    len('length', 'Deck length (along the boards)', '16', ['ft', 'm']),
    len('width', 'Deck width (across the boards)', '12', ['ft', 'm']),
    len(
      'boardWidth',
      'Board width',
      '5.5',
      ['in', 'mm', 'cm'],
      'Actual width: a 5/4×6 or 2×6 board is about 5.5 in.',
    ),
    {
      ...len(
        'gap',
        'Gap between boards',
        '1/8',
        ['in', 'mm'],
        'Follow the board manufacturer’s spacing.',
      ),
      exclusiveMin: false,
    },
    len(
      'boardLength',
      'Board length',
      '16',
      ['ft', 'm'],
      'Common lengths are 12, 16 and 20 ft (3.6, 4.8 m).',
    ),
    len(
      'joistSpacing',
      'Joist spacing (on center)',
      '16',
      ['in', 'cm'],
      '16 in (40 cm) is common; some boards require 12 in.',
    ),
    {
      id: 'waste',
      kind: 'number',
      label: 'Extra for waste',
      default: '10',
      suffix: '%',
      max: 100,
    },
  ],
  calculate(inputs) {
    const lengthM = inputs.unit('length');
    const widthM = inputs.unit('width');
    const result = deckMaterials({
      lengthM,
      widthM,
      boardWidthM: inputs.unit('boardWidth'),
      gapM: inputs.unit('gap'),
      boardLengthM: inputs.unit('boardLength'),
      joistSpacingM: inputs.unit('joistSpacing'),
      wastePercent: inputs.num('waste'),
    });
    const metric = isMetric(inputs.unitOf('length'));
    const area = lengthM * widthM;

    return {
      headline: { value: formatNumber(result.boards, 0), unit: plural(result.boards, 'board') },
      summary: `You need about ${formatNumber(result.boards, 0)} decking ${plural(result.boards, 'board')}, ${formatNumber(result.joists, 0)} ${plural(result.joists, 'joist')} and ${formatNumber(result.screws, 0)} screws.`,
      details: [
        {
          label: 'Deck area',
          value: metric
            ? `${formatNumber(area, 2)} m²`
            : `${formatNumber(fromBase(area, 'ft2'), 1)} ft²`,
        },
        { label: 'Rows of boards', value: formatNumber(result.rows, 0) },
        { label: 'Boards before waste', value: formatNumber(result.boardsRaw, 0) },
        {
          label: 'Decking length',
          value: metric
            ? `${formatNumber(result.linearM, 1)} m`
            : `${formatNumber(fromBase(result.linearM, 'ft'), 1)} linear ft`,
        },
        { label: 'Joists', value: formatNumber(result.joists, 0) },
        { label: 'Deck screws (2 per joist crossing)', value: formatNumber(result.screws, 0) },
      ],
      notes: ['Joist size, beams, posts and footings must follow local codes and span tables.'],
    };
  },
  content: {
    howItWorks: [
      'Boards run along the deck’s length. The number of rows is the deck width divided by one board width plus its gap, rounded up (the last board may need ripping to width). If boards are shorter than the deck, each row needs several boards joined over joists; if they are long enough, one board may give two or more rows.',
      'Joists run across the boards. Their count is the deck length divided by the joist spacing, rounded up, plus one for the end. Each board is fixed with two screws at every joist it crosses.',
    ],
    formula: [
      { label: 'Rows', expression: 'Rows = Width ÷ (Board width + Gap), rounded up' },
      {
        label: 'Boards per row',
        expression: 'Boards per row = Deck length ÷ Board length, rounded up',
      },
      { label: 'Boards', expression: 'Boards = Rows × Boards per row × (1 + Waste %), rounded up' },
      { label: 'Joists', expression: 'Joists = Deck length ÷ Joist spacing, rounded up, + 1' },
      { label: 'Screws', expression: 'Screws = Rows × Joists × 2' },
    ],
    assumptions: [
      'The deck is rectangular, with boards parallel to its length and no picture frame border.',
      'Rim joists, blocking, beams, posts, stairs and railings are not included.',
      'Hidden-fastener systems use clips instead of face screws; follow the manufacturer’s count.',
      'This is a materials estimate, not a structural design. Decks must meet local building codes.',
    ],
    examples: [
      {
        title: 'A 16 × 12 ft deck with 16 ft boards',
        values: {
          length: { value: '16', unit: 'ft' },
          width: { value: '12', unit: 'ft' },
          boardWidth: { value: '5.5', unit: 'in' },
          gap: { value: '1/8', unit: 'in' },
          boardLength: { value: '16', unit: 'ft' },
          joistSpacing: { value: '16', unit: 'in' },
          waste: '10',
        },
        steps: [
          'Rows = 144 in ÷ (5.5 + 0.125) in = 25.6, rounded up to 26',
          'Boards = 26 rows × 1 board per row = 26; with 10% waste = 28.6, rounded up to 29',
          'Joists = 192 in ÷ 16 in = 12, + 1 = 13',
          'Screws = 26 × 13 × 2 = 676',
        ],
        expected: '29',
      },
    ],
    faq: [
      {
        question: 'How many deck boards do I need for a 12 × 12 deck?',
        answer:
          'With 5.5 inch boards and ⅛ inch gaps, a 12 ft wide deck needs 26 rows. Using 12 ft boards that is 26 boards, or 29 with 10% waste.',
      },
      {
        question: 'What joist spacing do I need?',
        answer:
          '16 inches on center is common for wood decking laid square to the joists. Many composite boards and diagonal layouts require 12 inches. Check the decking manufacturer’s requirements.',
      },
      {
        question: 'How many screws per deck board?',
        answer:
          'Two screws at each joist the board crosses. For a board crossing 13 joists, that is 26 screws.',
      },
    ],
  },
};
