# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** the owner and their household, using it for real money every day. This is a live tool, not a demo.
- **Situation:** quick capture on a phone (installed PWA) when money moves, and sit-down review at a desktop. Both matter equally.
- **Jobs:** log an expense, receipt, or window-cleaning job in seconds; check where each budget category stands; track savings goals and recurring bills; keep side-business records straight.
- **Secondary:** people viewing it as a portfolio project. They matter less than daily use.

## Product Purpose

One authenticated app that runs household finances and a small side business together: transactions, monthly category budgets, recurring items, income, savings goals, fuel and business receipts, and window-cleaning customers and jobs. Success means the household keeps logging because it's fast, and the numbers are trustworthy enough to act on and to use for bookkeeping.

## Positioning

Household budgeting and real side-business bookkeeping (window-cleaning customers/jobs, fuel and business receipts) in one place, built for one specific household. It isn't a generic consumer budgeting app.

## Operating Context

- Phone: installed PWA (`static/manifest.json`, portrait, standalone) for in-the-moment logging.
- Desktop: weekly and monthly review of budgets, transactions, and trends.
- Automated weekly summary emails (Brevo) bring the user back to review.
- External API under `src/routes/api/v1`, with scoped, revocable API keys for driving the app from outside tools.
- Admin area: users, API keys and logs, archived goals, deleted-customer recovery.

## Capabilities and Constraints

- Stack already exists: SvelteKit 2 / Svelte 5, Tailwind v4, shadcn-svelte (bits-ui), layerchart, SQLite/Drizzle, better-auth. Deployed on fly.io (`yyz`).
- Light and dark themes are both supported (`mode-watcher`).
- Strict nonce-based CSP with deliberate carve-outs (`docs/CSP.md`). Visual work must not require new inline script or style sources without review.
- Email verification is required. Sign-up is open, but the real audience is the household.
- Window-cleaning and receipts are first-class business records, not throwaway features.
- Terminology in use: Transactions, Budget, Categories, Recurring, Income, Savings / Goals, Receipts (Fuel, Business), Window Cleaning (Customers, Jobs).

## Brand Commitments

- Name: **Sheppakai Budget** (manifest short name "Budget"). The landing page currently says "Budget Tracker", which is inconsistent. Resolve it toward the product name.
- No logo, voice guide, or visual identity has been committed yet.

## Evidence on Hand

- Real feature set and code: the routes under `src/routes/(app)`.
- PWA icons: `static/icons/`.
- No testimonials, user counts, or metrics exist. Don't fabricate any.

## Product Principles

1. **Fast capture beats completeness.** Logging an expense or receipt must take seconds on a phone. Friction kills the habit.
2. **Honest numbers.** Show over-budget states and shortfalls plainly, without softening or hiding them.
3. **Encourage progress.** Celebrate real wins such as goals reached or budgets held. Keep it proportionate and never let it obscure the truth.
4. **Business-grade records.** Receipts and window-cleaning data must be accurate, complete, and recoverable enough for tax and bookkeeping.
5. **Equal on phone and desktop.** Neither layout is a degraded version of the other.
