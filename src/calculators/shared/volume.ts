import type { ResultDetail, SelectField } from '../types';
import { formatNumber, plural } from '../../utils/format';
import { convert, fromBase } from '../../utils/units';

/** Round up a count, ignoring floating-point dust (37.0000000001 → 37). */
export function ceilCount(value: number): number {
  if (value <= 0) return 0;
  return Math.ceil(value - 1e-9);
}

/** Bag sizes commonly sold for mulch, soil and compost. Values are "<unit>:<size>". */
export function bagSizeField(defaultValue = 'ft3:2'): SelectField {
  return {
    id: 'bag',
    kind: 'select',
    label: 'Bag size',
    help: 'Check the volume printed on the bag you plan to buy.',
    options: [
      { value: 'ft3:1.5', label: '1.5 cubic feet' },
      { value: 'ft3:2', label: '2 cubic feet' },
      { value: 'ft3:3', label: '3 cubic feet' },
      { value: 'l:40', label: '40 liters' },
      { value: 'l:50', label: '50 liters' },
      { value: 'l:70', label: '70 liters' },
    ],
    default: defaultValue,
  };
}

/** Bag option value ("ft3:2") → volume in m³ plus a readable label. */
export function parseBagSize(value: string): { m3: number; label: string } {
  const [unit = 'ft3', size = '2'] = value.split(':');
  const amount = Number(size);
  const label = unit === 'l' ? `${size} L` : `${size} cu ft`;
  return { m3: convert(amount, unit, 'm3'), label };
}

export function bagsNeeded(volumeM3: number, bagM3: number): number {
  return ceilCount(volumeM3 / bagM3);
}

/** Headline volume: cubic yards for imperial measurements, cubic metres for metric. */
export function volumeHeadline(m3: number, metric: boolean): { value: string; unit: string } {
  return metric
    ? { value: formatNumber(m3, 2), unit: 'cubic meters' }
    : { value: formatNumber(fromBase(m3, 'yd3'), 2), unit: 'cubic yards' };
}

export function volumeDetails(m3: number): ResultDetail[] {
  return [
    { label: 'Cubic yards', value: `${formatNumber(fromBase(m3, 'yd3'), 2)} yd³` },
    { label: 'Cubic feet', value: `${formatNumber(fromBase(m3, 'ft3'), 1)} ft³` },
    { label: 'Cubic meters', value: `${formatNumber(m3, 2)} m³` },
    { label: 'Liters', value: `${formatNumber(fromBase(m3, 'l'), 0)} L` },
  ];
}

export function bagsDetail(count: number, bagLabel: string): ResultDetail {
  return {
    label: `Bags (${bagLabel})`,
    value: `${formatNumber(count, 0)} ${plural(count, 'bag')}`,
  };
}

/** Area detail lines in both systems. */
export function areaDetails(m2: number): ResultDetail[] {
  return [
    {
      label: 'Area',
      value: `${formatNumber(fromBase(m2, 'ft2'), 1)} ft² (${formatNumber(m2, 2)} m²)`,
    },
  ];
}
