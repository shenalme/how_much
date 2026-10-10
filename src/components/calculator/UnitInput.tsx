import { NumberInput } from './NumberInput';
import { UnitSelect } from './UnitSelect';

interface UnitInputProps {
  id: string;
  label: string;
  value: string;
  unit: string;
  units: string[];
  onChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
}

/** A number with a unit selector attached. Changing the unit keeps the typed number. */
export function UnitInput({
  id,
  label,
  value,
  unit,
  units,
  onChange,
  onUnitChange,
  onBlur,
  invalid,
  describedBy,
  placeholder,
}: UnitInputProps) {
  return (
    <NumberInput
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      invalid={invalid}
      describedBy={describedBy}
      placeholder={placeholder}
      addon={
        units.length > 1 ? (
          <UnitSelect
            id={`${id}-unit`}
            units={units}
            value={unit}
            onChange={onUnitChange}
            label={`Unit for ${label.toLowerCase()}`}
          />
        ) : undefined
      }
    />
  );
}
