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
- Follows ESLint (`eslint.config.js`) and Prettier conventions.
- Uses Tailwind CSS for consistent styling.

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
