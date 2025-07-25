# SvelteKit Budgeting App

## Features

- User authentication (register, sign in, sign out)
- SQLite database with Drizzle ORM (users, expenses, income, categories)
- Zod for validation
- Superforms for form handling
- shadcn-svelte components
- Dashboard with progress bars for money in/out
- Expenses table, filterable by date/category
- Route protection for authenticated users

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run database migrations**

   ```bash
   npm run migrate
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open http://localhost:5173**

---

## Notes

- This is a starter. You may expand the API endpoints, add more filtering, and improve security/session handling for production.
- To add new categories, add UI and endpoint for `/categories`.
- Use the shadcn-svelte docs to style and expand your UI.
