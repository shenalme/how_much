import { formatNumber } from '../../utils/format';

/** Metres → "5 ft 10.87 in" (inches rounded to 2 decimals, carrying 12 in to a foot). */
export function feetAndInches(meters: number): string {
  const totalInches = meters / 0.0254;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round((totalInches - feet * 12) * 100) / 100;
  if (inches >= 12) {
    feet += 1;
    inches -= 12;
  }
  return `${formatNumber(feet, 0)} ft ${formatNumber(inches, 2)} in`;
}
