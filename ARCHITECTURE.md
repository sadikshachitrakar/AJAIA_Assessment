# Architecture Note

## Summary
A lightweight Google Docs–style editor: create, rename and format
documents, import .txt/.md/.docx files, and share documents as Editor or
Viewer. One Next.js app on Vercel, with Postgres on Neon.

Live: https://ajaia-assessment-rosy-six.vercel.app

## How it fits together

    Browser: Next.js pages + TipTap editor
       │  fetch / file upload
       ▼
    Route handlers: /api/documents, /api/documents/[id]/share, /api/import
       │  each request: signed-cookie user → permission check → zod validation
       ▼
    lib/: auth · permissions · documents · import · sanitize
       │
       ▼
    Prisma → Neon Postgres

## Data model
- **User:** id, email, name (three seeded demo users)
- **Document:** id, title, content (sanitized HTML), ownerId, timestamps
- **DocumentShare:** documentId, userId, role (viewer or editor);
  one share per user per document

## Key decisions
| Decision | Why | Tradeoff |
|---|---|---|
| Next.js full stack on Vercel | One repo, one deploy, fastest path to a testable URL | Serverless has no persistent disk, so no file storage |
| Neon + Prisma instead of Supabase | Neon's free tier wakes up automatically, while Supabase pauses inactive free projects, which could take the demo down during review. Prisma keeps the access rules in testable TypeScript | Supabase's built-in auth, storage and realtime aren't used |
| Content stored as sanitized HTML | The importers and the editor both use HTML, so one format covers import, storage and display. Every import and save is cleaned against an allowlist that matches the editor | TipTap's JSON format would make structured diffs easier, e.g. for revision history |
| Mocked login: pick a seeded user, HMAC-signed cookie | Allowed by the brief, and makes sharing quick to review | Not production login |
| Access rules as pure functions (`lib/permissions.ts`) | One source of truth for every route, unit-tested for every role and action | None significant |
| 404 for no access, 403 for disallowed actions by shared users | People without access can't tell a document exists | None significant |
| Import creates a new document | Useful in practice, and needs no file storage | Images, links and code formatting are dropped; tables become plain text |
| Debounced autosave (800 ms, one save in flight at a time) | Feels like Google Docs, and an older save can't overwrite a newer one | Between two users, the last save wins |
| Viewer/Editor roles as the one stretch feature | Deepens sharing and reuses the permission tests | None significant |

## What I prioritized and why
1. **Core flows working end to end on the live site:** create, edit,
   format, persist, import, share. That's what reviewers will try first.
2. **Correct access control.** Sharing is where bugs matter most, so the
   rules are enforced on every route and tested for every role.
3. **Reliable saving.** Failed saves are visible and recoverable, edits
   aren't lost when leaving the page, and losing access mid-edit locks
   the editor with a clear message.
4. **Reviewer experience:** seeded users, a "Switch user" link, and the
   supported file types stated in the UI.

## Deliberately deprioritized
- Real-time co-editing and presence (the last save wins instead)
- Revision history and a caching layer
- Real login
- Comments and export
- Images, tables, links and code blocks in documents
- File attachments (import covers the upload requirement)

## Known limitations
- If two people edit at once, the later save overwrites the earlier one.
- Local development and production share one database.

## Testing
- 54 Vitest unit tests: permissions (every role × every action), import
  conversion, sanitizer, and file validation.
- Agent-run HTTP checks for 400/401/403/404/409 responses and browser
  tests of every flow, plus my own manual pass on the live site.
