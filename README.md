# AJAIA_Assessment
AI-Native Full Stack Developer Assignment

A lightweight Google Docs–inspired editor.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · TipTap · Prisma + Neon Postgres · zod · Vitest

## Setup

1. Install dependencies (also runs `prisma generate`):
   ```bash
   npm install
   ```
2. Create your env file from the template and fill in the three values:
   ```bash
   cp .env.example .env
   ```
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`) |
   | `DIRECT_URL` | Neon **direct** connection string (same host without `-pooler`) |
   | `SESSION_SECRET` | Random secret: `openssl rand -hex 32` |
3. Create the tables and seed demo data:
   ```bash
   npm run db:push   # uses DIRECT_URL
   npm run db:seed   # alice@demo.com, bob@demo.com, carol@demo.com + a doc Alice shares with Bob
   ```
4. Run it:
   ```bash
   npm run dev       # http://localhost:3000
   npm test          # unit tests
   ```

On Vercel, set the same three variables in the project settings.

## Auth (mocked)

`/login` lists the seeded users. Choosing one sets an httpOnly cookie containing the user id,
HMAC-SHA256 signed with `SESSION_SECRET`. `proxy.ts` rejects missing or invalid cookies
(redirect to `/login` for pages, 401 for `/api/*`); `getCurrentUser()` in `lib/auth.ts` loads the user.
Use **Switch user** in the header to jump between demo accounts.

## Access rules

Defined as pure functions in `lib/permissions.ts` and enforced by every document route.

| | View | Edit content | Rename | Share | Delete |
|---|---|---|---|---|---|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shared user | ✓ | ✓ | – | – | – |
| Anyone else | 404 | 404 | 404 | 404 | 404 |

## Status

- [x] Scaffold, schema, seed, mock login
- [x] Document CRUD, dashboard, editor, autosave
- [x] Sharing
- [ ] Import (.txt / .md / .docx)
- [ ] Validation pass + tests
