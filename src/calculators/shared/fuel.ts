/**
 * Fuel economy conversions. Everything is converted to litres per kilometre internally.
 *   US gallon = 3.785411784 L, UK (imperial) gallon = 4.54609 L, mile = 1.609344 km
 */
import type { Field, SelectField } from '../types';
import { formatNumber } from '../../utils/format';

const KM_PER_MILE = 1.609344;
const L_PER_GAL_US = 3.785411784;
const L_PER_GAL_UK = 4.54609;

export type EconomyUnit = 'mpgUS' | 'mpgUK' | 'l100km' | 'kml';

export function litersPerKm(value: number, unit: EconomyUnit): number {
  switch (unit) {
    case 'mpgUS':
      return L_PER_GAL_US / (value * KM_PER_MILE);
    case 'mpgUK':
      return L_PER_GAL_UK / (value * KM_PER_MILE);
    case 'l100km':
      return value / 100;
    case 'kml':
      return 1 / value;
  }
}

export function economyFromLitersPerKm(lpk: number): Record<EconomyUnit, number> {
  return {
    mpgUS: L_PER_GAL_US / (lpk * KM_PER_MILE),
    mpgUK: L_PER_GAL_UK / (lpk * KM_PER_MILE),
    l100km: lpk * 100,
    kml: 1 / lpk,
  };
}

export const ECONOMY_LABELS: Record<EconomyUnit, string> = {
  mpgUS: 'mpg (US)',
  mpgUK: 'mpg (UK)',
  l100km: 'L/100 km',
  kml: 'km/L',
};

export type PriceUnit = 'perL' | 'perGalUS' | 'perGalUK';

export function pricePerLiter(value: number, unit: PriceUnit): number {
  if (unit === 'perGalUS') return value / L_PER_GAL_US;
  if (unit === 'perGalUK') return value / L_PER_GAL_UK;
  return value;
}

export function economyFields(defaultValue = '30', defaultUnit: EconomyUnit = 'mpgUS'): Field[] {
  const unitField: SelectField = {
    id: 'economyUnit',
    kind: 'select',
    label: 'Fuel economy unit',
    options: (Object.keys(ECONOMY_LABELS) as EconomyUnit[]).map((value) => ({
      value,
      label: ECONOMY_LABELS[value],
    })),
    default: defaultUnit,
  };
  return [
    {
      id: 'economy',
      kind: 'number',
      label: 'Fuel economy',
      help: 'From your trip computer, or the official figure for your vehicle.',
      default: defaultValue,
      exclusiveMin: true,
      max: 10000,
    },
    unitField,
  ];
}

export function priceFields(defaultValue = '3.50', defaultUnit: PriceUnit = 'perGalUS'): Field[] {
  return [
    { id: 'price', kind: 'number', label: 'Fuel price', default: defaultValue, max: 100000 },
    {
      id: 'priceUnit',
      kind: 'select',
      label: 'Price per',
      options: [
        { value: 'perGalUS', label: 'US gallon' },
        { value: 'perGalUK', label: 'UK gallon' },
        { value: 'perL', label: 'Liter' },
      ],
      default: defaultUnit,
    },
  ];
}

export function economySummary(lpk: number): { label: string; value: string }[] {
  const e = economyFromLitersPerKm(lpk);
  return [
    { label: 'Miles per US gallon', value: formatNumber(e.mpgUS, 1) },
    { label: 'Miles per UK gallon', value: formatNumber(e.mpgUK, 1) },
    { label: 'Liters per 100 km', value: formatNumber(e.l100km, 2) },
    { label: 'Kilometers per liter', value: formatNumber(e.kml, 2) },
  ];
}

export function fuelVolumeText(liters: number): string {
  return `${formatNumber(liters, 1)} L (${formatNumber(liters / L_PER_GAL_US, 2)} US gal, ${formatNumber(liters / L_PER_GAL_UK, 2)} UK gal)`;
}
