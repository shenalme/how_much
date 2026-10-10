import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../../App';
import { loadCalculator } from '../../calculators/registry';
import { RouterProvider } from '../../router/Router';

function renderAt(url: string) {
  return render(
    <RouterProvider url={url}>
      <App />
    </RouterProvider>,
  );
}

await loadCalculator('mulch-calculator');

describe('pages', () => {
  it('renders the homepage hero, search and sections', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('HOWMUCH');
    expect(screen.getByRole('heading', { name: 'Popular tools' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Browse by category' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Need help figuring something out?' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('What do you need to calculate?')).toBeInTheDocument();
  });

  it('renders a tool page with breadcrumb, calculator and content', () => {
    renderAt('/garden/mulch-calculator');
    expect(screen.getByRole('heading', { level: 1, name: 'Mulch Calculator' })).toBeInTheDocument();
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(
      within(breadcrumb)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Home', 'Garden', 'Mulch Calculator']);
    expect(screen.getByRole('region', { name: 'Result' })).toHaveTextContent('2.78');
    for (const heading of [
      'How the calculation works',
      'Formula',
      'Examples',
      'Frequently asked questions',
      'Related tools',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    const related = screen.getByRole('region', { name: 'Related tools' });
    expect(within(related).getByRole('link', { name: /^Soil Calculator/ })).toHaveAttribute(
      'href',
      '/garden/soil-calculator',
    );
  });

  it('renders a category page with intro, tools and related categories', () => {
    renderAt('/garden');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Garden calculators' }),
    ).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: /^Mulch Calculator/ })).toHaveAttribute(
      'href',
      '/garden/mulch-calculator',
    );
    expect(screen.getByRole('heading', { name: 'Related categories' })).toBeInTheDocument();
  });

  it('renders the tool directory', () => {
    renderAt('/calculators');
    expect(
      screen.getByRole('heading', { level: 1, name: 'All calculators and tools' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recently added' })).toBeInTheDocument();
  });

  it('renders the 404 page with search and suggestions', () => {
    renderAt('/garden/not-a-tool');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "We couldn't find that tool.",
    );
    expect(screen.getByLabelText('Search all tools')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Browse categories' })).toBeInTheDocument();
  });

  it('marks legal pages as drafts', () => {
    renderAt('/privacy');
    expect(screen.getByText('Draft for review')).toBeInTheDocument();
  });

  it('navigates client-side and updates the document title', async () => {
    const user = userEvent.setup();
    renderAt('/garden');
    const main = screen.getByRole('main');
    await user.click(within(main).getByRole('link', { name: /^Mulch Calculator/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mulch Calculator' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Mulch Calculator: How Much Mulch Do I Need? | HOWMUCH');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://YOURDOMAIN.COM/garden/mulch-calculator',
    );
  });
});
