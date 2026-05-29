# Sheppakai Budget

Sheppakai Budget is a full-stack personal finance and small business management app built as a portfolio project. It combines household budgeting with business workflows in one clean interface: track spending, monitor goals, manage recurring items, and stay on top of day-to-day financial decisions.

## Features ✨

- **Authentication** — Register, sign in, sign out, email verification, and password reset
- **Dashboard** — Visual overview of income, expenses, and budget progress
- **Budget Management** — Set monthly budgets per category, see over-budget alerts
- **Transactions** — Filterable expense/income table by date and category
- **Income Tracking** — Log and manage multiple income sources
- **Savings Goals** — Create and track savings goals with contribution history
- **Recurring Expenses** — Configure and auto-reset recurring monthly expenses
- **Receipts** — Separate tracking for fuel and business receipts
- **Window Cleaning** — Customer management and job tracking for a window cleaning business
- **Weekly Email Summaries** — Automated weekly financial summary emails
- **Admin Dashboard** — User management, archived goals, deleted customer recovery
- **Dark Mode** — Full light/dark theme support
- **PWA** — Installable as a standalone app with offline support
- **Error Monitoring** — Sentry integration

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Framework      | SvelteKit 2 / Svelte 5  |
| Styling        | Tailwind CSS 4          |
| UI Components  | bits-ui / shadcn-svelte |
| Forms          | Superforms + Zod        |
| Database       | SQLite via Drizzle ORM  |
| Authentication | Better Auth             |
| Email          | Resend                  |
| Charts         | Layerchart (D3-based)   |
| Monitoring     | Sentry                  |
| Testing        | Vitest + Playwright     |
| Linting        | Oxlint + Oxfmt          |

## What This Project Demonstrates

- Building and shipping a production-style SvelteKit application end to end
- Designing reusable UI systems with component-driven architecture
- Modeling real-world financial workflows in a relational database
- Implementing authentication, validation, and robust form handling
- Maintaining code quality with automated formatting, linting, and tests

## Running Locally

This project is developer-ready and runs locally with a standard Node setup.

### Prerequisites

- **Node.js 22.22.2** (required for better-sqlite3 compatibility)
  - Optional with nvm: `nvm use 22.22.2`

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open http://localhost:5173**

### Common Scripts

```bash
npm run fmt           # Format code with Oxfmt
npm run lint          # Run Oxlint and static analysis checks
npm run check:all     # Format, lint, and test in one pass
npm run db:generate   # Generate Drizzle schema types
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Drizzle Studio (database browser)
npm run test          # Run unit tests
```

## Additional Documentation

- [BACKUP_RESTORE.md](./docs/BACKUP_RESTORE.md) for operational backup and recovery procedures
- [BACKUP_QUICK_REFERENCE.md](./docs/BACKUP_QUICK_REFERENCE.md) for fast backup commands
