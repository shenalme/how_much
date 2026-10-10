import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { loadCalculator } from './calculators/registry';
import { resolveRoute } from './router/routes';
import { RouterProvider } from './router/Router';
import './styles/global.css';

async function start() {
  const container = document.getElementById('root');
  if (!container) throw new Error('Missing #root element');

  const route = resolveRoute(window.location.pathname);
  // Load the calculator before hydrating so the client's first render matches the prerendered HTML.
  if (route.type === 'tool') await loadCalculator(route.tool.slug).catch(() => undefined);

  const app = (
    <StrictMode>
      <RouterProvider>
        <App />
      </RouterProvider>
    </StrictMode>
  );

  // Hydrate only when the HTML was prerendered for this exact route. GitHub Pages
  // serves 404.html for unknown URLs (including "/garden/mulch-calculator/"), so
  // the markup may belong to a different route; render fresh in that case.
  if (container.hasChildNodes() && container.dataset.route === route.path) {
    hydrateRoot(container, app);
  } else {
    container.textContent = '';
    createRoot(container).render(app);
  }
}

void start();
