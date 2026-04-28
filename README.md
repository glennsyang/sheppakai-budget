# Sheppakai Budget

A personal finance and business management app built with SvelteKit. Track monthly income and expenses, organize spending into categories, set savings goals, manage receipts, and handle window cleaning business operations — all in one place.

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
| Linting        | Oxlint                  |

## Getting Started 🚀

### Prerequisites

- **Node.js 22.13.1** (required for better-sqlite3 compatibility)
  - Use nvm: `nvm use 22.13.1` or `nvm install 22.13.1`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=file://./local-copy.db

# Authentication (required in production, min 32 characters)
BETTER_AUTH_SECRET=your-secure-secret-key-minimum-32-characters-long
BETTER_AUTH_BASE_URL=http://localhost

# Email (Resend API for transactional emails)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_ADDRESS=noreply@yourdomain.com
RESEND_NEW_USER_ADDRESS=admin@yourdomain.com

# Monitoring (optional in development)
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# Node Environment
NODE_ENV=development
```

**Notes:**

- `BETTER_AUTH_SECRET` is **required** in production and must be at least 32 characters
- In development, fallback values are used for convenience
- The app will fail fast on startup if required variables are missing in production

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

### Useful Scripts

```bash
npm run db:generate   # Generate Drizzle schema types
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Drizzle Studio (database browser)
npm run test          # Run unit tests
npm run lint          # Run Oxlint
```

---

## Database Backups 💾

The application includes automated daily backups of the production database.

- **Schedule**: Daily at 6:00 AM UTC
- **Retention**: 30 days via GitHub Artifacts
- **Manual trigger**: Available via GitHub Actions

### Quick Backup Commands

```bash
# Trigger manual backup
gh workflow run backup-database.yml

# Test restore locally
./scripts/test-restore.sh backup-YYYY-MM-DD-HHMMSS.sql.gz

# Emergency production backup
flyctl ssh console -a sheppakai-budget -C \
  "sqlite3 /data/sheppakaibudget.db .dump" > backup-$(date +%Y%m%d).sql
```

📖 **Full Documentation**:

- [BACKUP_RESTORE.md](./docs/BACKUP_RESTORE.md) — Complete backup and restore procedures
- [BACKUP_QUICK_REFERENCE.md](./docs/BACKUP_QUICK_REFERENCE.md) — Quick command reference
