# External API (`/api/v1`)

A small JSON API for driving sheppakai-budget from outside the web UI — a personal AI
assistant, a script, or a future mobile client. Authenticated with API keys, not session
cookies, so an external tool never needs your personal login.

## Authentication

Every request must include:

```
Authorization: Bearer <key>
```

- The key is **only** ever read from the `Authorization` header. It is never accepted as a
  query parameter, and a browser session cookie is never accepted as a fallback — the two
  auth paths are fully independent.
- Keys are created and revoked from **Admin → API Keys** (`/admin/api-keys`) in the web UI,
  by an admin account. The plaintext key is shown exactly once, at creation time — only a
  hash is stored, so if you lose it you'll need to revoke it and create a new one.
- Each key is scoped to a specific set of permissions (see below) and can optionally expire.
- Each key has its own rate limit; repeated requests beyond it return `429`.

## Scopes

| Scope                | Grants                      |
| -------------------- | --------------------------- |
| `transactions:read`  | `GET /api/v1/transactions`  |
| `transactions:write` | `POST /api/v1/transactions` |
| `budgets:read`       | `GET /api/v1/budgets`       |
| `categories:read`    | `GET /api/v1/categories`    |
| `dashboard:read`     | `GET /api/v1/dashboard`     |

A key only needs the scopes for the endpoints it's meant to call — pick the narrowest set
that covers the intended use.

## Response shape

Every response is one of exactly two shapes:

```jsonc
// Success
{ "data": /* endpoint-specific payload */ }

// Failure
{ "error": { "code": "some_code", "message": "Human-readable explanation" } }
```

| HTTP status | `error.code`                                             | Meaning                                                                                                                                                                              |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 401         | `missing_header` / `invalid_scheme` / `malformed_header` | No `Authorization` header, wrong scheme, or malformed value                                                                                                                          |
| 401         | `invalid_api_key`                                        | Key doesn't exist, is disabled, expired, or lacks the scope the endpoint requires (deliberately indistinguishable from an unknown key, so a caller can't probe which reason applies) |
| 429         | `rate_limited`                                           | This key's rate limit or request quota was exceeded — wait and retry                                                                                                                 |
| 400         | `validation_failed`                                      | Request body or query parameters failed validation                                                                                                                                   |
| 400         | `invalid_json`                                           | Request body wasn't valid JSON                                                                                                                                                       |
| 500         | `internal_error`                                         | Something went wrong server-side; check the server logs                                                                                                                              |

## CORS

No `Access-Control-Allow-Origin` header is ever returned. This API is for server-to-server
or script use (curl, a backend job, an assistant's tool call) — not for calling directly
from browser JavaScript on another site.

## Endpoints

### `GET /api/v1/transactions`

Requires `transactions:read`. Query parameters (all optional):

- `startDate` / `endDate` — `YYYY-MM-DD`, must be given together
- `categoryId`
- `limit` — only applies when no date range is given; 1-200, default 50

```bash
curl -H "Authorization: Bearer sk_live_xxx" \
  "https://budget.example.com/api/v1/transactions?startDate=2026-08-01&endDate=2026-08-31"
```

### `POST /api/v1/transactions`

Requires `transactions:write`. Body:

```bash
curl -X POST -H "Authorization: Bearer sk_live_xxx" -H "Content-Type: application/json" \
  -d '{
    "amount": 42.50,
    "payee": "Grocery Store",
    "notes": "Weekly shop",
    "date": "2026-08-12",
    "categoryId": "cat_123",
    "excludedFromBudget": false
  }' \
  "https://budget.example.com/api/v1/transactions"
```

Returns `201` with the created transaction (including its resolved category and owner) on
success. Every write — successful or failed — is recorded in an internal audit log with the
key that made it, so activity from an external tool is traceable if something looks wrong.

### `GET /api/v1/budgets`

Requires `budgets:read`. Query parameters:

- `year` — required
- `month` — optional; when omitted, returns the whole year's budgets

```bash
curl -H "Authorization: Bearer sk_live_xxx" \
  "https://budget.example.com/api/v1/budgets?year=2026&month=8"
```

### `GET /api/v1/categories`

Requires `categories:read`. No parameters.

```bash
curl -H "Authorization: Bearer sk_live_xxx" "https://budget.example.com/api/v1/categories"
```

### `GET /api/v1/dashboard`

Requires `dashboard:read`. The same summary numbers the Dashboard page computes (totals,
budget progress, spending trends, savings goals). Query parameters:

- `mode` — `monthly` (default) or `yearly`
- `month` / `year` — for `mode=monthly`
- `year` / `view` (`current` or `full`) — for `mode=yearly`

```bash
curl -H "Authorization: Bearer sk_live_xxx" \
  "https://budget.example.com/api/v1/dashboard?mode=monthly&month=8&year=2026"
```

## Out of scope

- OAuth2/third-party app authorization — API keys are enough for a single-user "give my own
  tool a key" setup
- Write access to user/auth-management endpoints
- Webhooks
