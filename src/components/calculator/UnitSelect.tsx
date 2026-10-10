import { getUnit } from '../../utils/units';

interface UnitSelectProps {
  id: string;
  units: string[];
  value: string;
  onChange: (unit: string) => void;
  /** Accessible name, e.g. "Unit for length". */
  label: string;
}

export function UnitSelect({ id, units, value, onChange, label }: UnitSelectProps) {
  return (
    <select
      id={id}
      className="unit-select"
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
    >
      {units.map((unitId) => {
        const unit = getUnit(unitId);
        return (
          <option key={unitId} value={unitId}>
            {unit.symbol}
          </option>
        );
      })}
    </select>
  );
}
