# SvelteKit Budgeting App

This budgeting app is designed to help individuals and families take control of their finances. It provides a simple way to track monthly income and expenses, organize spending into categories, and see where your money goes. The app makes it easy to set goals, monitor progress, and build better financial habits over time.

Whether you want to save more, spend less, or just understand your financial picture, this app gives you the tools to make smarter decisions. With clear visualizations and easy-to-use features, it turns budgeting into a positive and empowering experience.

## Features ✨

- User authentication (register, sign in, sign out)
- SQLite database with Drizzle ORM (users, expenses, income, categories)
- Zod for validation
- Superforms for form handling
- shadcn-svelte components
- Dashboard with progress bars for money in/out
- Expenses table, filterable by date/category
- Route protection for authenticated users

## Getting Started 🚀

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

## Notes 📝

- This is a starter. You may expand the API endpoints, add more filtering, and improve security/session handling for production.
- To add new categories, add UI and endpoint for `/categories`.
- Use the shadcn-svelte docs to style and expand your UI.
