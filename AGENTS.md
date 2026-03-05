# Project Overview

This is a SvelteKit web application for tracking monthly budgets, managing expenses, and visualizing spending. The app leverages SvelteKit (Svelte 5) for the frontend, Tailwind CSS for styling, and SQLite (via Drizzle ORM) for the database. It offers a modern, clean UI with both light and dark mode, and strong support for reusable UI components.

## Folder Structure

- `/src/routes`: SvelteKit frontend routes and page handlers.
- `/src/lib`: App logic—backend utilities, server/database logic, authentication, type definitions, and reusable UI components.
  - `/src/lib/components/ui/`: Extensive library of primitive and advanced Svelte UI components (Button, Dialog, Table, Popover, Dropdown, etc.) for consistent, efficient interface building.
  - `/src/lib/server/db/`: Database connection, migrations, schema, and utilities.
- `/static`: Static assets (e.g., favicon.svg, images).
- `/docs` (if present): Supplementary documentation, API specs, and user guides.

### Database

- The SQLite database file (`sheppakaibudget.db`) in the repo is for local development and testing only.
  - Database schema/migrations can be found in `/src/lib/server/db/migrations/`.

## Libraries and Frameworks

- SvelteKit (using Svelte 5)
- Tailwind CSS
- Drizzle ORM for SQLite
- Zod for validation
- Superforms and shadcn-svelte UI (see `/src/lib/components/ui/`)

## Development Basics

- See the `README.md` file for full installation, running, and build instructions—including how to migrate the database and start the dev server.
- Common scripts (run with `npm run <script>`):
  - `dev` – Start the dev server
  - `build` – Build the app
  - `check`, `check:watch` – Type/lint/check project
  - `lint` – Run Prettier and ESLint
  - `test`, `test:unit` – Vitest unit tests
  - `db:migrate`, `db:generate`, `db:studio` – Drizzle database actions

## Environment and Config

- Main config file: `src/env.ts`
- Reads from `.env` file (if present):
  - `NODE_ENV`, `DATABASE_URL`, `DB_MIGRATING`, `DB_SEEDING`
- You must set these environment variables for production/development as needed.

## Coding Standards

- Use semicolons at the end of each statement.
- Use single quotes for strings.
- Avoid using `any` type entirely - use proper typing, generics, or `unknown` instead.
- Follows ESLint (`eslint.config.js`) and Prettier conventions.
- Uses Tailwind CSS for consistent styling.

## Svelte/SvelteKit Reactive Patterns

### ❌ AVOID: EventListener and onMount Anti-Patterns

**NEVER** use `window.addEventListener()` or DOM event listeners for form submissions or data revalidation:

```svelte
// ❌ BAD - Don't do this!
onMount(() => {
  const handleFormSubmit = () => {
    setTimeout(() => invalidateAll(), 500);
  };
  window.addEventListener('submit', handleFormSubmit);
  return () => window.removeEventListener('submit', handleFormSubmit);
});
```

**Minimize use of `onMount()`** - only use when absolutely necessary (e.g., initializing third-party libraries, browser-only APIs). Most reactive behavior should use Svelte's built-in reactivity.

### ✅ CORRECT: SvelteKit Form Patterns

**Use SvelteKit's built-in form handling:**

1. **Form actions with `use:enhance`** (automatically revalidates):

```svelte
<form method="POST" action="?/create" use:enhance>
	<!-- SvelteKit handles submission and revalidation -->
</form>
```

2. **Manual invalidation after actions** (if needed):

```svelte
import { invalidateAll } from '$app/navigation';

async function handleAction() {
  await fetch('/api/endpoint', { method: 'POST' });
  await invalidateAll(); // Revalidate all data
}
```

3. **Reactive state with $effect** (Svelte 5):

```svelte
let data = $state(initialData);

$effect(() => {
  // Runs when dependencies change
  console.log('Data updated:', data);
});
```

4. **Event handlers on specific elements**:

```svelte
<button onclick={handleClick}>Submit</button>
```

### When onMount() IS Appropriate

- Initializing browser-only APIs (canvas, IntersectionObserver)
- Setting up third-party libraries (charts, maps)
- Reading/manipulating DOM measurements
- Setting up WebSocket connections

### When onMount() is NOT Needed

- Fetching data (use `+page.server.ts` load functions)
- Listening to form submissions (use `use:enhance`)
- Reacting to prop/state changes (use `$effect` or `$derived`)
- Setting initial state (use `let value = $state(initial)`)

## UI Guidelines

- Modern, clean interface.
- Toggle for light/dark mode is provided.
- Extensive reusable UI primitives/components in `/src/lib/components/ui/`.
  - Includes: Button, Dialog, Calendar, Table, Dropdown, Input, Popover, Progress, Select, Separator, Skeleton, Sonner notifications, and more.

## Authentication & Security

- Routes and server endpoints for user authentication: register, sign-in, sign-out, as well as route-protected pages (see `/src/routes/auth/`, `/src/lib/server/auth.ts`).

## Database

- Uses SQLite with Drizzle ORM
- Migrations/scripts are in `/src/lib/server/db/migrations/`

## Additional Documentation

- For in-depth setup, customization, or usage, see `README.md`.
- If present, the `/docs` directory provides expanded guides and API documentation.

## Node.js Version

- This project requires **Node.js version 22.13.1** for development and production to ensure compatibility and stability. Please use a version manager (like nvm or asdf) to set your Node version accordingly. If you encounter any errors while running commands in the terminal, please make sure the node version being used is 22.13.1. You can achieve this by running the command: `nvm use 22.13.1`.

## Database Driver: better-sqlite3

- The project uses `better-sqlite3` as the underlying SQLite driver. This package offers high-performance, synchronous access to SQLite databases in Node.js, and is a required dependency for local development, running migrations, and all database interactions via Drizzle ORM.
- Drizzle ORM in this project is configured to use `better-sqlite3` for reliable local database access. You do not need to install or configure SQLite separately—everything works out of the box after running `npm install` with the correct Node version.

## Issue Tracking

This project uses **bd (beads)** for issue tracking.
Run `bd prime` for workflow context.

**Quick reference:**

- `bd ready` - Find unblocked work
- `bd create "Title" --type task --priority 2` - Create issue
- `bd close <id>` - Complete work
- `bd sync` - Sync with git (run at session end)

<!-- BEGIN BEADS INTEGRATION -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- END BEADS INTEGRATION -->
