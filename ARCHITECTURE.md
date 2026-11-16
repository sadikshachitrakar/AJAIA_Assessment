# Architecture Note

## Summary
A lightweight Google Docs–style editor: create, rename, and format
documents, import .txt/.md/.docx files, and share documents with other
users. One Next.js app on Vercel, with Postgres on Neon.

Live: https://ajaia-assessment-rosy-six.vercel.app

## How it fits together

    Browser (Next.js pages + TipTap editor)
       │  fetch / file upload
       ▼
    Route handlers: /api/documents, /api/documents/[id]/share, /api/import
       │  each request: getCurrentUser() → permission check → zod validation
       ▼
    lib/: auth · permissions · documents · import · sanitize
       │
       ▼
    Prisma → Neon Postgres (User, Document, DocumentShare)

## Data model
- **User:** id, email, name (three seeded demo users)
- **Document:** id, title, content (sanitized HTML), ownerId, timestamps
- **DocumentShare:** documentId, userId, [role: viewer | editor],
  unique per document and user

## Key decisions
| Decision | Why | Tradeoff |
|---|---|---|
| Next.js full stack on Vercel | One repo, one deploy, fastest path to a testable URL | Serverless has no persistent disk, so no file storage |
| Neon + Prisma instead of Supabase | Neon's free tier wakes automatically, while Supabase's pauses inactive projects, which risks the demo being down during review. Access rules stay in testable TypeScript | Supabase's auth, storage and realtime aren't needed at this scope |
| Content stored as sanitized HTML | Importers and the editor both use HTML, so one format covers import, storage and display. Every write is sanitized against an allowlist matching the editor | TipTap JSON would make structured diffs easier, e.g. for version history |
| Mocked auth: pick a seeded user, HMAC-signed cookie | Allowed by the brief, and makes sharing quick to review | Not production auth |
| Access rules as pure functions (`lib/permissions.ts`) | One source of truth for every route, fully unit-tested | None significant |
| 404 for no access, 403 for shared users on owner-only actions | Strangers can't tell a document exists | None significant |
| Import creates a new document | Product-relevant, and needs no file storage | Images and tables aren't imported; markdown code blocks and links keep only their text |
| Debounced autosave (800 ms, one save in flight at a time) | Feels like Google Docs, and an older save can't overwrite a newer one | Between two users, the last write wins |

## What I prioritized
1. Core flows working end to end on the live site: create, edit,
   format, persist, import, share.
2. Correct access control, because sharing is where bugs matter most.
   It's enforced on every route and covered by tests.
3. Reliable saving: failures are visible and recoverable, and edits
   aren't lost when leaving the page.
4. Reviewer experience: seeded users, a "Switch user" link, and
   supported file types stated in the UI.

## Deliberately deprioritized
- Real-time co-editing and presence (last write wins instead)
- Real authentication
- Comments, version history, export
- File attachments (import covers the upload requirement)

## Known limitations
- If two people edit at once, the later save overwrites the earlier one.
- Local development and production share one database.

## Testing
- [N] Vitest unit tests: permissions (every role × every action),
  import conversion, sanitizer, file validation.
- Agent-run HTTP checks for 400/401/403/404/409 cases and browser
  tests of each flow, plus my own manual pass on the live site.

## Next 2–4 hours
1. **Conflict detection (~1 h):** send the document version with each
   save and return 409 on a stale write, so concurrent edits aren't
   silently lost.
2. **Real authentication with Auth.js magic links (~1 h).**
3. **Version history (~1–2 h):** throttled snapshots with restore.
4. **Separate dev database and CI (~30 min):** a Neon branch for
   development, and tests run on every push.