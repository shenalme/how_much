# HOWMUCH: calculators, converters and everyday tools

A fast, static library of practical calculators (mulch, concrete, paint, horse pasture, fuel cost, dates, unit conversions and more), built with React, TypeScript and Vite and deployed to **GitHub Pages** on your own domain.

Every tool has its own permanent, indexable URL (for example `/garden/mulch-calculator`). Every page is **prerendered to real HTML at build time**, with its own title, description, canonical URL, Open Graph tags and structured data, so search engines and social previews see full content without running JavaScript. There is no server, database or API: all calculations run in the visitor's browser.

> **Before you launch:** replace the placeholder domain (`YOURDOMAIN.COM`), review the draft Privacy and Terms pages, and set your contact email. See [Launch checklist](#launch-checklist).

---

## Contents

- [What's included](#whats-included)
- [Tech stack](#tech-stack)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [How routing works on GitHub Pages](#how-routing-works-on-github-pages)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Connecting your custom domain](#connecting-your-custom-domain)
- [Where to change the brand and domain](#where-to-change-the-brand-and-domain)
- [How to add a calculator](#how-to-add-a-calculator)
- [How to add a category](#how-to-add-a-category)
- [How SEO works](#how-seo-works)
- [Search](#search)
- [Testing](#testing)
- [Adding Google Analytics later](#adding-google-analytics-later)
- [Adding AdSense later](#adding-adsense-later)
- [Launch checklist](#launch-checklist)
- [Moving beyond GitHub Pages later](#moving-beyond-github-pages-later)

---

## What's included

- **43 working calculators** in 12 categories, including all 36 originally specified:
  - **Garden:** Mulch, Soil, Raised Bed Soil, Compost, Garden Area, Grass Seed, Sod, Fence
  - **Home / Construction:** Concrete, Paint, Flooring, Tile, Gravel, Deck
  - **Animals:** Horse Fence, Horse Pasture, Horse Feed
  - **Math:** Percentage, Discount, Ratio, Average, Age
  - **Conversions:** Feet ↔ Meters, Inches ↔ Centimeters, Pounds ↔ Kilograms, Acres ↔ Hectares, Fahrenheit ↔ Celsius
  - **Time & Dates:** Age in Days, Date Difference, Days Between Dates
  - **Automotive / Travel:** Fuel Cost, MPG, Road Trip Fuel, Travel Time
  - **Finance / Business / Cooking:** Mortgage, Tip, Profit Margin, Recipe Scaler
- Homepage with search, popular tools and categories; a full tool directory at `/calculators`; a page per category; About, Contact, Privacy (draft) and Terms (draft) pages; a helpful 404 page.
- Instant client-side search with synonyms, partial matches and keyboard navigation.
- A reusable calculator engine: each tool is a small definition file, not a page.
- Prerendered HTML for every route, generated `sitemap.xml` and `robots.txt`.
- An analytics abstraction (no tracking by default) and reserved ad slots (render nothing until enabled).
- 790+ automated tests, ESLint, Prettier, TypeScript strict mode and a GitHub Actions pipeline that tests, builds, verifies and deploys.

## Tech stack

| Concern | Choice                                                                             |
| ------- | ---------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript (strict)                                                      |
| Build   | Vite 8 (client build + SSR build used only for prerendering)                       |
| Styling | One hand-written CSS file with design tokens; system fonts (no web-font downloads) |
| Routing | A ~150-line router with real `<a href>` links and the History API                  |
| Tests   | Vitest, Testing Library, jsdom                                                     |
| Quality | ESLint (typescript-eslint, jsx-a11y, react-hooks), Prettier                        |
| Hosting | GitHub Pages via GitHub Actions                                                    |

Runtime dependencies are just `react` and `react-dom`. The JavaScript every page loads is about 100 kB gzipped (mostly React); each calculator's own code is a separate 2–4 kB chunk loaded only on its page, so adding tools does not slow existing pages down.

## Local development

Requirements: **Node.js 20.19+ or 22+** (see `.nvmrc`) and npm.

```bash
npm install          # install dependencies
npm run dev          # start the dev server at http://localhost:5173
npm test             # run all tests once
npm run lint         # ESLint
npm run format       # Prettier (write); format:check to verify
npm run build        # typecheck, build and prerender into dist/
npm run test:build   # verify the built site (pages, titles, canonicals, sitemap…)
npm run preview      # serve dist/ locally
npm run ci           # everything the CI pipeline runs, in order
```

`npm run build` runs four steps:

1. `tsc` type-checks the whole project.
2. `vite build` builds the browser bundle into `dist/`.
3. `vite build --ssr src/entry-server.tsx` builds a renderer into `dist-ssr/`.
4. `node scripts/prerender.mjs` renders every route to HTML, writes `sitemap.xml`, `robots.txt` and `404.html`, then deletes `dist-ssr/`.

The output in `dist/` is plain static files.

## Project structure

```
.
├── .github/workflows/deploy.yml   CI: lint, format check, tests, build, verify, deploy
├── index.html                     HTML template (head markers are filled per page)
├── public/
│   ├── CNAME                      ← your domain (YOURDOMAIN.COM placeholder)
│   ├── favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512.png
│   ├── og-default.png             default social share image (1200×630)
│   └── site.webmanifest
├── scripts/
│   ├── prerender.mjs              static generation, sitemap, robots, 404
│   ├── verify-build.mjs           build test used in CI
│   └── set-domain.mjs             `npm run set-domain example.com`
└── src/
    ├── config/site.ts             ← brand, domain, analytics, ads settings (one place)
    ├── data/categories.ts         categories: names, intros, tips, related categories
    ├── calculators/
    │   ├── types.ts               ToolMeta + CalculatorDefinition types
    │   ├── engine.ts              validation, evaluation, Inputs accessor
    │   ├── registry.ts            auto-discovers tools; lazy-loads calculators
    │   ├── shared/                reusable maths and field sets (area, volume, fence, fuel, converter)
    │   └── <category>/<slug>/
    │       ├── meta.ts            title, description, keywords, related tools (eager)
    │       └── calculator.ts      fields, calculate(), formula, examples, FAQ (lazy)
    ├── components/
    │   ├── calculator/            CalculatorForm, NumberInput, UnitInput, UnitSelect, ResultCard,
    │   │                          CopyResultButton, ResetButton, FormulaSection, ExampleSection,
    │   │                          FAQSection, RelatedTools, ReferenceTables…
    │   ├── layout/                Header, Footer, Logo
    │   ├── search/SearchBox.tsx   accessible combobox search
    │   ├── tools/                 ToolCard/ToolGrid, CategoryCard/CategoryGrid
    │   ├── ads/AdSlot.tsx         future ad positions (inactive by default)
    │   └── ui/                    Icon, Breadcrumbs, Alert, Button, PageHeader
    ├── pages/                     Home, Directory, Category, Tool, About, Contact, Privacy, Terms, 404
    ├── router/                    routes.ts (URL → page), Router.tsx (Link, navigation), base.ts
    ├── seo/                       meta.ts, head.ts, structuredData.ts, sitemap.ts
    ├── search/                    search.ts, synonyms.ts
    ├── analytics/                 provider-agnostic analytics + consent state
    ├── utils/                     units, number parsing/formatting, calendar dates
    ├── styles/global.css          design tokens and components
    ├── tests/                     unit, component, routing, search and SEO tests
    ├── entry-client.tsx           hydrates the prerendered HTML in the browser
    └── entry-server.tsx           build-time renderer used by prerender.mjs
```

## How routing works on GitHub Pages

GitHub Pages only serves files. A single-page app normally breaks there: visiting `/garden/mulch-calculator` directly, or refreshing it, returns a 404 because no such file exists.

This project avoids the problem entirely by **generating a real HTML file for every route at build time**:

| URL                        | File served                                        |
| -------------------------- | -------------------------------------------------- |
| `/`                        | `index.html`                                       |
| `/garden`                  | `garden.html` (also copied to `garden/index.html`) |
| `/garden/mulch-calculator` | `garden/mulch-calculator.html`                     |
| `/about`                   | `about.html`                                       |
| anything else              | `404.html` (GitHub returns HTTP 404)               |

GitHub Pages serves `garden/mulch-calculator.html` for the clean URL `/garden/mulch-calculator`, so direct visits and refreshes return a complete page with HTTP 200. No redirect tricks, no hash URLs, no `?p=` query hacks.

Once the page loads, React **hydrates** the existing HTML and takes over navigation: internal links are normal `<a href>` elements (crawlable, open-in-new-tab works) that the router intercepts for instant page changes. The client normalises variants such as `/garden/` or `/garden.html` to the canonical URL.

If someone requests an unknown URL, GitHub serves `404.html`, which renders the "We couldn't find that tool" page with a `noindex` tag. If the URL is a variant of a real page (for example a trailing slash on a tool URL), the client recognises it and shows the right page instead.

After your first deployment you can confirm the behaviour:

```bash
curl -sI https://YOURDOMAIN.COM/garden/mulch-calculator | head -1   # HTTP/2 200
curl -sI https://YOURDOMAIN.COM/garden | head -1                    # HTTP/2 200
curl -sI https://YOURDOMAIN.COM/not-a-page | head -1                # HTTP/2 404
```

## Deploying to GitHub Pages

The repository is assumed to be `USERNAME/PROJECTNAME`. Replace both with your own values below.

1. **Create the repository** on GitHub (public, or private on a plan that supports Pages).
2. **Push the code:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/PROJECTNAME.git
   git push -u origin main
   ```

3. **Enable Pages with GitHub Actions:** in the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. The **Test, build and deploy** workflow (`.github/workflows/deploy.yml`) runs on every push to `main`. It installs dependencies, runs ESLint, checks formatting, runs the test suite, builds and prerenders the site, verifies the output and deploys `dist/` to Pages. If any step fails, nothing is deployed. Pull requests run the same checks without deploying.
5. Watch progress under the **Actions** tab. The first deployment URL appears on the workflow run and under **Settings → Pages**.

### Previewing before the domain is connected (optional)

Without a custom domain, a project site lives at `https://USERNAME.github.io/PROJECTNAME/`, a sub-path. To preview there, add a repository variable under **Settings → Secrets and variables → Actions → Variables**: name `BASE_PATH`, value `/PROJECTNAME/`. Delete the variable once your custom domain is connected (the domain serves from `/`). Canonical URLs always use the domain in `src/config/site.ts`, so the preview won't compete with your real site in search.

To try a sub-path build locally: `BASE_PATH=/PROJECTNAME/ npm run build`.

## Connecting your custom domain

You need to do five things. The order matters a little: set the domain in the code first so canonical URLs are right from the first deploy.

### 1. Put your domain in the project

```bash
npm run set-domain example.com        # or: npm run set-domain www.example.com
git commit -am "Set domain" && git push
```

This updates **`src/config/site.ts`** (`DOMAIN`) and **`public/CNAME`**. Use whichever host name you choose as your primary (see below). The build fails if the two ever disagree.

### 2. Choose `www` or the root (apex) domain

Both work. Your visitors can type either; GitHub redirects the other one automatically when DNS for both is configured.

- **Recommended: `www.example.com` as primary.** A `CNAME` record for `www` points at GitHub and keeps working even if GitHub changes its IP addresses, and it makes a future move to another host or CDN a one-record change. The apex `example.com` still works and redirects to `www`.
- **Alternative: `example.com` (apex) as primary.** Looks shorter in the address bar. It relies on GitHub's published IP addresses (A/AAAA records), which have been stable for years. `www.example.com` redirects to it.

Whichever you pick, configure **both** sets of records below so both names work.

### 3. Configure DNS at your registrar

Create these records (delete any existing conflicting A, AAAA or CNAME records for the same names, including registrar "parking" records):

**For the root / apex domain (`example.com`, often shown as `@`):**

| Type | Name | Value               |
| ---- | ---- | ------------------- |
| A    | @    | 185.199.108.153     |
| A    | @    | 185.199.109.153     |
| A    | @    | 185.199.110.153     |
| A    | @    | 185.199.111.153     |
| AAAA | @    | 2606:50c0:8000::153 |
| AAAA | @    | 2606:50c0:8001::153 |
| AAAA | @    | 2606:50c0:8002::153 |
| AAAA | @    | 2606:50c0:8003::153 |

**For `www`:**

| Type  | Name | Value              |
| ----- | ---- | ------------------ |
| CNAME | www  | USERNAME.github.io |

Use your GitHub **user or organisation name** in `USERNAME.github.io`, without the repository name and without a trailing path. (Some registrars want a trailing dot: `USERNAME.github.io.`)

Some DNS providers offer `ALIAS`/`ANAME` records for the apex; pointing one at `USERNAME.github.io` is an alternative to the A/AAAA records. Do not use a wildcard record (`*.example.com`).

These IP addresses come from GitHub's documentation ("Managing a custom domain for your GitHub Pages site"). Check that page if anything has changed.

### 4. Set the custom domain in GitHub

1. Go to **Settings → Pages → Custom domain**, enter the same host name you put in `site.ts` (for example `www.example.com`) and click **Save**. GitHub runs a DNS check.
2. **Verify the domain** (recommended, protects against takeover): your GitHub profile or organisation **Settings → Pages → Add a domain**, then add the TXT record GitHub shows you.

When deploying with GitHub Actions, the custom domain is stored in the repository settings; the `CNAME` file in the build is kept for consistency and for branch-based deployment, but the Settings value is what counts.

### 5. Wait for DNS and HTTPS

DNS changes usually appear within minutes but can take up to 24–48 hours. Once the DNS check passes, GitHub issues a free TLS certificate (this can take up to an hour or so). Then tick **Enforce HTTPS** in **Settings → Pages**.

Check from your machine:

```bash
dig example.com +noall +answer        # should list the four 185.199.x.153 addresses
dig www.example.com +noall +answer    # should show the CNAME to USERNAME.github.io
```

## Where to change the brand and domain

Everything brand-related lives in **`src/config/site.ts`**:

| Setting                                                    | Field                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Domain (used for canonicals, sitemap, robots, social tags) | `DOMAIN` (also in `public/CNAME`; use `npm run set-domain`)                         |
| Brand name                                                 | `name`                                                                              |
| Text logo                                                  | `logo.text` (swap the markup in `src/components/layout/Logo.tsx` for an image logo) |
| Tagline and default description                            | `tagline`, `description`                                                            |
| Contact email                                              | `contactEmail`                                                                      |
| Social profiles                                            | `social`, `twitterHandle`                                                           |
| Analytics and ads switches                                 | `analytics`, `ads`                                                                  |

Also update when rebranding: `public/og-default.png` (the share image contains the wordmark), the favicons in `public/`, `public/site.webmanifest` and the `theme-color` in `index.html`. Colours are CSS custom properties at the top of `src/styles/global.css`.

## How to add a calculator

A tool is one folder with two files. Nothing else needs registering: the registry discovers it, and routing, search, the sitemap, category pages and related links pick it up automatically.

**1. Create the folder** `src/calculators/<category>/<slug>/`. The folder names define the permanent URL `/<category>/<slug>`.

**2. Add `meta.ts`** (small, loaded on every page):

```ts
import type { ToolMeta } from '../../types';

export const meta: ToolMeta = {
  slug: 'patio-paver-calculator',
  category: 'construction',
  title: 'Patio Paver Calculator',
  description:
    'Work out how many pavers you need for a patio from its size, the paver size and a waste allowance.',
  keywords: ['pavers', 'patio', 'paving', 'bricks', 'stones'],
  aliases: ['paver calculator'],
  related: ['gravel-calculator', 'concrete-calculator', 'garden-area-calculator'],
  added: '2026-11-01',
};
```

**3. Add `calculator.ts`** (loaded only on its page):

```ts
import type { CalculatorDefinition } from '../../types';
import { formatNumber, plural } from '../../../utils/format';
import { areaFields, readArea } from '../../shared/area';
import { ceilCount } from '../../shared/volume';

export const calculator: CalculatorDefinition = {
  slug: 'patio-paver-calculator',
  intro: 'Enter your patio size and paver size to see how many pavers to buy.',
  fields: [
    ...areaFields({ noun: 'patio' }),
    {
      id: 'paverLength',
      kind: 'unit',
      label: 'Paver length',
      dimension: 'length',
      units: ['in', 'cm'],
      defaultUnit: 'in',
      default: '8',
      exclusiveMin: true,
    },
    {
      id: 'paverWidth',
      kind: 'unit',
      label: 'Paver width',
      dimension: 'length',
      units: ['in', 'cm'],
      defaultUnit: 'in',
      default: '4',
      exclusiveMin: true,
    },
    { id: 'waste', kind: 'number', label: 'Extra for cuts', default: '10', suffix: '%', max: 100 },
  ],
  calculate(inputs) {
    const paver = inputs.unit('paverLength') * inputs.unit('paverWidth'); // m²
    const count = ceilCount((readArea(inputs) / paver) * (1 + inputs.num('waste') / 100));
    return {
      headline: { value: formatNumber(count, 0), unit: plural(count, 'paver') },
      summary: `You need about ${formatNumber(count, 0)} pavers.`,
    };
  },
  content: {
    howItWorks: ['Explain the method in plain language.'],
    formula: [{ expression: 'Pavers = Area ÷ Paver area × (1 + Waste %)' }],
    assumptions: ['List anything the estimate depends on.'],
    examples: [
      {
        title: 'A 20 × 15 ft patio',
        values: {},
        steps: ['Write the worked steps.'],
        expected: '1,485',
      },
    ],
    faq: [
      { question: 'A real question people ask?', answer: 'A useful answer.' },
      { question: 'Another one?', answer: 'Another useful answer.' },
    ],
  },
};
```

Key ideas:

- **Fields** are declarative: `number`, `unit` (number + unit selector), `select`, `date`, `numberList` and `text`. Use `showWhen` to show a field only for certain choices, `optional` for fields that may be blank, and `min`/`exclusiveMin`/`max`/`integer` for constraints. Validation messages are generated for you.
- **`calculate`** receives validated values. `inputs.unit(id)` returns the value converted to the base unit (meters, m², m³, kg, °C…), so you never convert units by hand. Throw `CalcInputError(message, fieldId)` for combinations that don't make sense.
- **Shared helpers** in `src/calculators/shared/` cover area inputs, volumes and bags, fences, fuel economy and one-way converters (`createConverter`). Reuse them rather than duplicating maths.
- **Examples are checked:** the result shown under each example is computed live, and the test suite fails if it doesn't equal `expected`.

**4. Add tests** in `src/tests/calculators/` for typical values, edge cases and unit conversions. The generic suite (`all-calculators.test.ts`) automatically tests every new tool for valid metadata, defaults, worked examples, invalid text, negatives, zero, decimals, maximums and very large values.

**5. Run** `npm test && npm run build && npm run test:build`, then push. The sitemap, search index and category pages update themselves.

To show a tool in **Popular tools**, give it a `popularity` number (lower = earlier). To list it in an extra category, add `alsoIn: ['travel']`; it keeps its primary URL.

**URLs are permanent.** Don't rename a published tool's folder. If you ever must, keep the old URL working (for example by keeping a small page that links to the new one) so existing links and rankings aren't lost.

## How to add a category

1. Add the id to the `CategoryId` union and a new entry to the `categories` array in `src/data/categories.ts`: name, H1 heading, one-line summary, meta description, introductory paragraphs (make them genuinely useful), optional tips, related categories and an icon.
2. If you need a new icon, add a path to `src/components/ui/Icon.tsx`.
3. Create `src/calculators/<new-category>/` and add tools to it.

A category gets a page, navigation entry and sitemap entry automatically as soon as it has at least one tool; empty categories stay hidden so there are never thin pages.

## How SEO works

All SEO output is generated at build time from the same data the app uses, so it can't drift out of date.

- **Unique `<title>` and meta description** per page, from tool metadata (`title`/`seoTitle`, `description`) and category data. The build test fails on duplicates.
- **Canonical URL** on every indexable page: `https://<DOMAIN><path>`, built from `src/config/site.ts`. The domain is defined exactly once.
- **Open Graph and Twitter/X tags** for rich link previews, using `public/og-default.png`.
- **Prerendered content:** the H1, introduction, calculator with its default result, formula, examples, FAQ and related links are all in the HTML file.
- **Structured data (JSON-LD)** that matches visible content:
  - `WebSite` on the homepage;
  - `WebApplication` (a free browser-based tool, `price: 0`) and `BreadcrumbList` on tool pages;
  - `CollectionPage` and `BreadcrumbList` on category pages; `BreadcrumbList` on others.
  - `FAQPage` is **off by default**: since 2023 Google shows FAQ rich results only for well-known government and health sites. The FAQs remain visible on the page. To emit the markup anyway, set `structuredData.faqPage: true` in `site.ts`.
  - No ratings, reviews or other data the page doesn't show.
- **`sitemap.xml`** lists every indexable page with `<lastmod>` from each tool's `updated`/`added` date. It is generated from the route list; never edit it by hand.
- **`robots.txt`** allows crawling and points to the sitemap.
- **Internal linking:** breadcrumbs, related tools (from each tool's `related` list, topped up from the same category), category pages, the directory and footer.
- **404 page** is `noindex` and has no canonical.
- **Performance:** prerendered HTML, small JS, no web fonts, no layout shift from ads (slots render nothing until enabled, then reserve space).

After launch, add the site to **Google Search Console** and **Bing Webmaster Tools** and submit `https://<DOMAIN>/sitemap.xml`.

## Search

Search runs entirely in the browser over tool metadata: titles, aliases, slugs, keywords, categories and descriptions, weighted in that order. It understands partial words (`mortg`), synonyms and abbreviations (`lbs`, `kg`, `petrol`, `turf`; see `src/search/synonyms.ts`), ignores question words ("How much concrete do I need?" → concrete), respects conversion direction ("lbs to kg"), and suggests related tools after the direct matches. Searching "Convert 50 lbs to kg" opens the converter with 50 filled in.

Any calculator can be pre-filled from the URL: `?fieldId=value` and `?fieldId_unit=unitId`, for example `/garden/mulch-calculator?depth=2&depth_unit=in`.

## Testing

```bash
npm test             # 790+ tests
npm run test:build   # after npm run build
```

- **Calculator tests** (`src/tests/calculators/`): formulas, normal values, zero, invalid input, very large values, decimals, unit conversions and rounding, per tool, plus a generic suite applied to every tool automatically.
- **Utility tests:** exact unit definitions, number parsing (decimal commas, fractions), rounding and formatting, calendar maths (leap years, month ends, DST safety).
- **Search, routing and SEO tests:** URL structure, trailing slashes and sub-path deploys, unique titles, canonicals, structured data and the sitemap.
- **Component tests:** the calculator form (labels, live results, inline accessible errors, reset, submit focus), the search combobox (keyboard navigation) and full page rendering.
- **Build test** (`scripts/verify-build.mjs`): every sitemap URL has a prerendered file with one title, one H1, a matching canonical, social tags and (for tools) a prerendered result; checks the 404 page, CNAME and the JavaScript size budget.

## Adding Google Analytics later

Nothing is tracked today. The code already calls a provider-agnostic API at the right moments:

```ts
analytics.trackToolUsed(toolId); // tool page opened
analytics.trackCalculationCompleted(toolId); // a valid result after the visitor changed inputs
analytics.trackSearch(query, resultCount);
analytics.trackCopyResult(toolId);
analytics.trackPageView(path); // client-side navigation
```

To enable GA4:

1. Create a GA4 property and copy the measurement ID (`G-XXXXXXXXXX`).
2. In `src/config/site.ts` set `analytics.provider: 'gtag'` and `analytics.gaMeasurementId`.
3. Add a consent banner or a certified consent management platform (required for visitors in the UK/EEA) and call `setConsent('granted' | 'denied')` from `src/analytics/consent.ts` when the visitor chooses. With `requireConsent: true` (the default), no script loads and no events are sent until consent is granted.
4. Update the Privacy page to describe the analytics.

To use another provider, implement the small `AnalyticsProvider` interface in `src/analytics/index.ts` and call `analytics.setProvider(...)`. Set `provider: 'console'` to see events in the browser console while developing.

## Adding AdSense later

Ad positions are already in the layout but render nothing:

- `tool-content`: on tool pages after the explanation and examples, well away from inputs and buttons;
- `tool-rail`: in the right-hand column on wide screens;
- `category`: below the tool grid on category pages.

When you're approved:

1. Add the AdSense script to `index.html` inside `<head>` (outside the `head:start`/`head:end` markers):
   `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>`
2. Create ad units in AdSense and put their IDs in `AD_UNIT_IDS` in `src/components/ads/AdSlot.tsx`.
3. In `src/config/site.ts` set `ads.enabled: true` and `ads.adsenseClientId`.
4. Add `public/ads.txt` with the line AdSense gives you (for example `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).
5. Use a Google-certified CMP for consent in the UK/EEA/Switzerland, and update the Privacy page.

Each slot is labelled "Advertisement", reserves its height to avoid layout shift, and is never placed next to calculator controls.

### What remains before applying for AdSense

- Connect the real domain with HTTPS, and let Google index the site (submit the sitemap in Search Console).
- Replace the draft **Privacy** and **Terms** pages with reviewed versions that cover analytics, cookies and advertising; set a real `contactEmail` and make sure the Contact page works.
- Review the About page so it accurately describes who runs the site.
- Add a consent management platform and connect it to `setConsent`.
- Keep adding genuinely useful tools and content; avoid thin or duplicate pages.
- Add `ads.txt` once you have a publisher ID.

## Launch checklist

- [ ] `npm run set-domain your-domain.com` and push
- [ ] DNS records at your registrar (A/AAAA for the apex, CNAME for `www`)
- [ ] Settings → Pages: source **GitHub Actions**, custom domain saved, domain verified, **Enforce HTTPS** ticked
- [ ] `contactEmail` in `src/config/site.ts` is an inbox you read
- [ ] Privacy and Terms reviewed; remove the `<DraftNotice />` from those pages
- [ ] Search Console and Bing Webmaster Tools: verify the site and submit the sitemap
- [ ] Spot-check a few calculators against your own numbers

## Moving beyond GitHub Pages later

The architecture keeps the door open:

- Tool data, calculation logic and UI are separate. Calculator definitions are plain TypeScript modules and could be served from an API or CMS without changing the components.
- The same React app already renders on the server (that's how prerendering works), so moving to a host with server-side rendering, incremental builds or edge functions is a hosting change, not a rewrite.
- `scripts/prerender.mjs` is the only GitHub Pages-specific piece; any static host (Cloudflare Pages, Netlify, S3 + CloudFront) can serve `dist/` as is.
- User features (saved calculations, accounts) can be added behind the same components with a backend when there is a real need.

### Recommended next phase

1. Launch on the real domain and connect Search Console; watch which queries bring people in.
2. Add shareable result links (the URL pre-fill already exists; add a "Copy link" button that writes the current inputs to the URL).
3. Expand the most-requested categories (cooking conversions, more finance, livestock beyond horses) using the existing shared helpers.
4. Add a unit-system preference (imperial/metric) remembered per visitor.
5. Add privacy-friendly analytics with consent, then decide on advertising.

---

Results are estimates. Formulas and assumptions are documented on every page; check important figures with a qualified professional.
