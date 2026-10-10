import type { Field } from '../../calculators/types';
import { getUnit } from '../../utils/units';
import { FieldShell } from './FieldShell';
import { NumberInput } from './NumberInput';
import { UnitInput } from './UnitInput';

interface FieldControlProps {
  formId: string;
  field: Field;
  value: string;
  unit?: string;
  error?: string;
  onChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  onBlur: () => void;
}

/** Renders the right control for a field definition. */
export function FieldControl({
  formId,
  field,
  value,
  unit,
  error,
  onChange,
  onUnitChange,
  onBlur,
}: FieldControlProps) {
  const inputId = `${formId}-${field.id}`;
  const label = field.optional ? `${field.label} (optional)` : field.label;
  const wide = field.wide || field.kind === 'numberList' || field.kind === 'text';

  return (
    <FieldShell inputId={inputId} label={label} help={field.help} error={error} wide={wide}>
      {(describedBy) => {
        const common = {
          id: inputId,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          onBlur,
        };
        switch (field.kind) {
          case 'number':
            return (
              <NumberInput
                id={inputId}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                invalid={Boolean(error)}
                describedBy={describedBy}
                placeholder={field.placeholder}
                prefix={field.prefix}
                suffix={field.suffix}
              />
            );
          case 'unit': {
            const selected = unit ?? field.defaultUnit;
            if (field.units.length === 1) {
              return (
                <NumberInput
                  id={inputId}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  invalid={Boolean(error)}
                  describedBy={describedBy}
                  placeholder={field.placeholder}
                  suffix={getUnit(selected).symbol}
                />
              );
            }
            return (
              <UnitInput
                id={inputId}
                label={field.label}
                value={value}
                unit={selected}
                units={field.units}
                onChange={onChange}
                onUnitChange={onUnitChange}
                onBlur={onBlur}
                invalid={Boolean(error)}
                describedBy={describedBy}
                placeholder={field.placeholder}
              />
            );
          }
          case 'select':
            return (
              <select
                {...common}
                className="select"
                value={value}
                onChange={(event) => onChange(event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          case 'date':
            return (
              <input
                {...common}
                className="input input--date"
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={value}
                onChange={(event) => onChange(event.target.value)}
              />
            );
          case 'numberList':
          case 'text':
            return (
              <textarea
                {...common}
                className="textarea"
                rows={field.kind === 'text' ? (field.rows ?? 6) : 4}
                value={value}
                placeholder={field.placeholder}
                spellCheck={field.kind === 'text'}
                onChange={(event) => onChange(event.target.value)}
              />
            );
        }
      }}
    </FieldShell>
  );
}
