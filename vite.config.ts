import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * BASE_PATH is only needed when the site is served from a sub-path such as
 * https://USERNAME.github.io/PROJECTNAME/ (before the custom domain is live).
 * With a custom domain the site is served from the root, so the default "/" is correct.
 */
const rawBase = process.env.BASE_PATH ?? '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
    // Used by scripts/prerender.mjs to preload each tool page's calculator chunk.
    manifest: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
