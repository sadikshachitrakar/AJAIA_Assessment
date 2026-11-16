# AJAIA_Assessment
AI-Native Full Stack Developer Assignment

A lightweight Google Docs–inspired editor.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · TipTap · Prisma + Neon Postgres · zod · Vitest
· marked · mammoth · sanitize-html

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

| | View | Edit content | Rename | Share / change roles | Delete |
|---|---|---|---|---|---|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shared as **editor** ("Can edit") | ✓ | ✓ | 403 | 403 | 403 |
| Shared as **viewer** ("Can view") | ✓ | 403 | 403 | 403 | 403 |
| Anyone else | 404 | 404 | 404 | 404 | 404 |

Strangers get 404 rather than 403, so they can't tell that a document exists. New shares default to
**editor**; the owner picks the role when sharing and can change it later from the Share dialog
(`PATCH /api/documents/[id]/share/[userId]`). Viewers get a read-only editor with no toolbar.

**Demo data** (`npm run db:seed`, safe to re-run): Alice owns *Welcome to Docs* (Bob: editor) and
*Team Handbook* (Bob: viewer). Carol has access to neither — sign in as each to compare.

## Importing files

**Import file** on the dashboard creates a new document owned by you, titled after the file name.

| Type | Converted with | Notes |
|---|---|---|
| `.txt` | built-in | Blank lines start new paragraphs; markup is shown as text, never run |
| `.md` | [marked](https://marked.js.org) (GFM) | Headings, bold, italic, lists |
| `.docx` | [mammoth](https://github.com/mwilson/mammoth.js) | Headings, bold, italic, underline, lists |

- Max **2 MB**. Files are checked by extension (browser MIME types for `.md` are unreliable).
- Everything is sanitized with `sanitize-html` down to the tags the editor supports:
  `p, h1–h3, strong/b, em/i, u, ul, ol, li, br`. Other tags are removed but their text is kept,
  so **images are dropped and tables become plain paragraphs**. `h4–h6` become `h3`.
- The same sanitizer runs on every content save, so the database only ever holds editor-safe HTML.

## Status

- [x] Scaffold, schema, seed, mock login
- [x] Document CRUD, dashboard, editor, autosave
- [x] Sharing
- [x] Import (.txt / .md / .docx)
- [ ] Validation pass + tests
