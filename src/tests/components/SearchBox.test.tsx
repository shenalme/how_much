import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SearchBox } from '../../components/search/SearchBox';
import { RouterProvider } from '../../router/Router';

function setup() {
  const user = userEvent.setup();
  render(
    <RouterProvider url="/">
      <SearchBox id="test" />
    </RouterProvider>,
  );
  return { user, input: screen.getByRole('combobox') };
}

describe('SearchBox', () => {
  it('shows matching tools with categories and descriptions', async () => {
    const { user, input } = setup();
    await user.type(input, 'horse');
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options[0]).toHaveTextContent(/Horse/);
    expect(options[0]).toHaveTextContent('Animals');
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports keyboard navigation', async () => {
    const { user, input } = setup();
    await user.type(input, 'mulch');
    await user.keyboard('{ArrowDown}');
    const first = screen.getAllByRole('option')[0];
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', first?.id);
    await user.keyboard('{Enter}');
    expect(window.location.pathname).toBe('/garden/mulch-calculator');
  });

  it('closes on Escape', async () => {
    const { user, input } = setup();
    await user.type(input, 'kg');
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('explains when nothing matches', async () => {
    const { user, input } = setup();
    await user.type(input, 'zzzqqq');
    expect(screen.getByText(/No tools match/)).toBeInTheDocument();
  });

  it('opens the full results page for broad queries', async () => {
    const { user, input } = setup();
    await user.type(input, 'calculator garden{Enter}');
    expect(window.location.pathname).toBe('/calculators');
    expect(window.location.search).toBe('?q=calculator%20garden');
  });
});
