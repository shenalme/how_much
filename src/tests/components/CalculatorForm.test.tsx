import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { loadCalculator } from '../../calculators/registry';
import { CalculatorForm } from '../../components/calculator/CalculatorForm';

const mulch = await loadCalculator('mulch-calculator');
const age = await loadCalculator('age-calculator');

function resultRegion() {
  return screen.getByRole('region', { name: 'Result' });
}

describe('CalculatorForm', () => {
  it('shows the default result immediately', () => {
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    expect(
      within(resultRegion()).getByText('You need approximately 2.78 cubic yards of mulch.'),
    ).toBeInTheDocument();
  });

  it('labels every input', () => {
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    expect(screen.getByLabelText('Length')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Mulch depth')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit for length')).toBeInTheDocument();
  });

  it('recalculates as the person types', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    const length = screen.getByLabelText('Length');
    await user.clear(length);
    await user.type(length, '40');
    expect(
      within(resultRegion()).getByText('You need approximately 5.56 cubic yards of mulch.'),
    ).toBeInTheDocument();
  });

  it('recalculates when a unit changes', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    await user.selectOptions(screen.getByLabelText('Unit for mulch depth'), 'cm');
    // 300 ft² × 3 cm (1.18 in) = 29.53 ft³ = 1.09 yd³
    expect(within(resultRegion()).getByText(/1\.09 cubic yards/)).toBeInTheDocument();
  });

  it('shows an accessible inline error for invalid input', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    const depth = screen.getByLabelText('Mulch depth');
    await user.clear(depth);
    await user.type(depth, 'abc');
    await user.tab();
    expect(depth).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByText(/Enter a number/);
    expect(depth.getAttribute('aria-describedby')).toContain(error.id);
    expect(
      within(resultRegion()).getByText('Correct the highlighted fields to see the result.'),
    ).toBeInTheDocument();
  });

  it('shows and hides fields for the chosen shape', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Shape of the bed'), 'circle');
    expect(screen.getByLabelText('Diameter')).toBeInTheDocument();
    expect(screen.queryByLabelText('Length')).not.toBeInTheDocument();
  });

  it('resets to the defaults', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    const length = screen.getByLabelText('Length');
    await user.clear(length);
    await user.type(length, '99');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Length')).toHaveValue('20');
  });

  it('moves focus to the first invalid field on submit', async () => {
    const user = userEvent.setup();
    render(<CalculatorForm calculator={mulch} title="Mulch Calculator" />);
    await user.clear(screen.getByLabelText('Width'));
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByLabelText('Width')).toHaveFocus();
    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('fills "today" defaults and URL values after mounting', () => {
    window.history.replaceState(null, '', '/math/age-calculator?birth=2000-01-01');
    render(<CalculatorForm calculator={age} title="Age Calculator" />);
    expect(screen.getByLabelText('Date of birth')).toHaveValue('2000-01-01');
    expect((screen.getByLabelText('Age on') as HTMLInputElement).value).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
