# AI Workflow Note

## Tools used
- **Claude (chat):** scoping the brief, stack decisions, step-by-step
  build prompts, debugging setup issues
- **Claude Code:** implementation in reviewed steps; verification via
  HTTP checks and real-browser testing (Chrome DevTools)

## Where AI materially sped up the work
- Turned the open-ended brief into a scoped plan, data model, and
  5-step build prompt in ~15 minutes.
- Step 2 (dashboard, document API, TipTap editor, debounced autosave)
  was built and verified in one pass, including 19 HTTP checks and
  browser tests such as a simulated network failure.
- Diagnosed database setup errors quickly: a placeholder DIRECT_URL
  (P1001) and a masked password (P1000).

## What I changed or rejected
- **Rejected Neon's auto-generated agent prompt:** it would have
  replaced the existing Prisma setup. I gave a scoped prompt instead.
- **Considered Supabase, chose Neon + Prisma:** Supabase's free tier
  pauses inactive projects, which risks the demo being down when
  reviewers test it; Prisma keeps access rules in testable TypeScript.
- **Unrequested delete feature:** the agent added owner-only delete.
  [Kept / removed, and why]
- [Add more as they happen]

## How I verified correctness, UX, and reliability
- **Correctness:** permission unit tests (Vitest); agent-run HTTP
  checks for 400/401/403/404 cases; manual two-user check on the
  live site.
- **UX:** manual pass checking that formatting survives a refresh,
  the save status indicator, and inline error states.
- **Reliability:** simulated a failed save and confirmed Retry
  recovers the text; confirmed pending edits save when leaving the page.