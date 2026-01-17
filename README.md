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

### Prerequisites

- **Node.js version 22.13.1** (required for better-sqlite3 compatibility)
  - Use nvm: `nvm use 22.13.1` or `nvm install 22.13.1`

### Environment Variables

Create a `.env` file in the root directory with the following required variables:

```env
# Database
DATABASE_URL=file://./local-copy.db

# Authentication (required in production, min 32 characters)
BETTER_AUTH_SECRET=your-secure-secret-key-minimum-32-characters-long

# Email (Resend API for transactional emails)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_ADDRESS=noreply@yourdomain.com
RESEND_NEW_USER_ADDRESS=admin@yourdomain.com

# Node Environment
NODE_ENV=development
```

**Important Notes:**

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
