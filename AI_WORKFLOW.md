# AI Workflow Note

## Tools used
- **Claude (chat):** turned the brief into a scoped plan, compared stack
  options, wrote step-by-step build prompts, and debugged setup issues.
- **Claude Code:** implemented each build step and verified its own work
  with HTTP checks and real-browser testing (Chrome DevTools).

## How I worked with AI
1. **Plan before code.** I used AI to list the brief's ambiguities,
   lock the decisions (stack, mocked auth, import-as-new-document,
   last-write-wins), and split the build into 5 steps.
2. **Fixed stack and spec up front.** The kickoff prompt pinned the
   stack, data model, access rules, and error codes, so the agent
   couldn't drift into over-engineering.
3. **Review gate after each step.** The agent listed the files it
   would touch, built one step, verified it, and stopped. Nothing was
   committed until I reviewed it.
4. **Parallel work.** I set up Neon and deployed to Vercel while the
   agent built the editor.

## Where AI materially sped up the work
- **Planning:** a scoped plan, data model, and build prompts in about
  15 minutes.
- **Editor and autosave (step 2):** dashboard, document API, TipTap
  editor, and debounced autosave built in one pass, plus 19 HTTP checks
  and browser tests, including a simulated network failure.
- **Sharing (step 3):** share and remove endpoints, the share dialog,
  dashboard badges, and 20 permission unit tests, verified end to end.
- **Setup debugging:** found two database errors in minutes. P1001 was
  a leftover placeholder `DIRECT_URL`; P1000 was a masked password,
  fixed by resetting it.

## What I changed or rejected
- **Rejected Neon's auto-generated agent prompt.** It would have
  replaced the existing Prisma setup with Neon's own driver. I gave a
  scoped prompt that kept the stack.
- **Chose Neon + Prisma over Supabase.** Supabase's free tier pauses
  inactive projects, which risks the demo being down when reviewers
  test it. Prisma keeps access rules in TypeScript, where they can be
  unit-tested.
- **Scope cuts were my calls, not the AI's:** no real-time co-editing
  (last write wins), mocked auth with seeded users, and a single
  "can edit" share level.
- **Added reviewer-focused requirements myself:** exact HTTP error
  codes, and a "Switch user" link so reviewers can test sharing without
  logging in and out.
- **Accepted the agent's design corrections after review:**
  - It turned `/login` into a user picker, because redirecting
    signed-in users would have broken "Switch user".
  - Only the owner sees the collaborator list, so shared users can't
    see other people's emails.
  - It upgraded `@types/node` for Vitest instead of forcing the install
    with `--legacy-peer-deps`.
- **Unrequested feature:** the agent added owner-only delete.
  [Kept / removed, and why]
- **Process correction:** I committed once while the agent was mid-step,
  which deployed a half-built version. After that, every prompt ended
  with "Don't commit until I've reviewed it."

## How I verified correctness, UX, and reliability
- **Access control:** 20 unit tests cover every role against every
  action. HTTP checks confirmed 401 with no session, 404 for strangers
  (so they can't tell a document exists), 403 for shared users trying
  owner-only actions, and 400/409 for bad share requests.
- **End-to-end sharing:** Alice shares with Bob, Bob edits, Carol gets
  404, Alice removes Bob, Bob loses access. Checked by the agent in a
  browser and by me on the live site. [Confirm once you've done it]
- **Autosave reliability:** no save on page load, about 23 keystrokes
  produce a single save, a failed save shows Retry and recovers the
  text, and pending edits save when leaving the page.
- **UX:** I checked manually that formatting survives a refresh
  [confirm], and the agent's browser tests caught and fixed two UX
  issues: dialog focus landing on "Close", and a raw validation message.
- **Import:** [add after step 4: fixture tests plus importing my own
  .md, .txt, and .docx files]

## Known limitations
- Concurrent edits: last write wins.
- Mocked auth is for demo purposes only and not production-safe.