# Docs: a lightweight collaborative editor

A small Google Docs–style editor built for the Ajaia AI-Native Full Stack
Developer assignment.

**Live app:** https://ajaia-assessment-rosy-six.vercel.app

**Test accounts:** no passwords. Pick a user on the login page, and use
**Switch user** in the header to change accounts.

| User | Email | In the demo |
|---|---|---|
| Alice | alice@demo.com | Owns the seed documents |
| Bob | bob@demo.com | Can edit one shared document and only view the other |
| Carol | carol@demo.com | Has no access to Alice's documents |

## Features
- Create, rename, edit and delete documents
- Rich text: bold, italic, underline, headings (H1–H3), bulleted and
  numbered lists
- Autosave with a status indicator (Saving… / Saved / Couldn't save, Retry)
- Import `.txt`, `.md` and `.docx` files (max 2 MB) as new documents.
  Images aren't imported, and tables come through as plain text.
- Share by email as **Editor** or **Viewer**; owners can change roles or
  remove access
- "My documents" and "Shared with me" shown separately on the dashboard

## Stack
Next.js (App Router) · TypeScript · Tailwind · TipTap · Prisma ·
Postgres (Neon) · zod · Vitest · Vercel

## Run locally
You need Node 20 or newer and a Postgres database. A free Neon database
works, and so does a local Postgres.

1. Install dependencies (this also runs `prisma generate`):
   ```bash
   npm install
   ```
2. Create your env file and fill in the three values:
   ```bash
   cp .env.example .env
   ```
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Pooled connection string (on Neon, the host contains `-pooler`) |
   | `DIRECT_URL` | Direct connection string. With a local Postgres, use the same value as `DATABASE_URL` |
   | `SESSION_SECRET` | Any random string, e.g. from `openssl rand -hex 32` |
3. Create the tables and seed the demo data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Start the app and run the tests:
   ```bash
   npm run dev     # http://localhost:3000
   npm test        # 54 unit tests
   ```

To deploy on Vercel, import the repo and set the same three environment
variables.

## How login works (mocked)
`/login` lists the seeded users. Picking one sets an httpOnly cookie with
the user id, signed with HMAC-SHA256 using `SESSION_SECRET`. Requests
without a valid cookie are sent to `/login` (pages) or get a 401 (API).
This is for the demo only, not production login.

## Access rules
Defined as pure functions in `lib/permissions.ts` and enforced on every
document route.

| | View | Edit content | Rename | Share / manage access | Delete |
|---|---|---|---|---|---|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Editor | ✓ | ✓ | – | – | – |
| Viewer | ✓ | – | – | – | – |
| Anyone else | 404 | 404 | 404 | 404 | 404 |

A shared user who tries something their role doesn't allow gets a 403.
Anyone without access gets a 404, so they can't tell the document exists.

## Project layout
```
app/api/documents/       document and sharing routes
app/api/import/          file import route
lib/permissions.ts       access rules
lib/import.ts            file conversion
lib/sanitize.ts          HTML cleaning for imports and saves
components/              editor, toolbar, share dialog, autosave hook
tests/                   unit tests and fixtures
sample-files/            example files for trying the import
screenshots/             key screens
```

## More
- `ARCHITECTURE.md`: decisions, tradeoffs and next steps
- `AI_WORKFLOW.md`: how I used AI and checked its work