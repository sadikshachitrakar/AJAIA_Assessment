# AJAIA_Assessment
AI-Native Full Stack Developer Assignment

A lightweight Google Docs–inspired editor.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Prisma + Neon Postgres · zod · Vitest

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL (pooled), DIRECT_URL (direct), SESSION_SECRET
npm run db:push        # create tables
npm run db:seed        # alice@demo.com, bob@demo.com, carol@demo.com + a sample shared doc
npm run dev
```

Generate a session secret with `openssl rand -base64 32`.

## Auth (mocked)

`/login` lists the seeded users. Choosing one sets an httpOnly cookie containing the user id,
HMAC-SHA256 signed with `SESSION_SECRET`. `proxy.ts` rejects missing or invalid cookies
(redirect to `/login` for pages, 401 for `/api/*`); `getCurrentUser()` in `lib/auth.ts` loads the user.

## Status

- [x] Scaffold, schema, seed, mock login
- [ ] Document CRUD, dashboard, editor, autosave
- [ ] Sharing
- [ ] Import (.txt / .md / .docx)
- [ ] Validation pass + tests
