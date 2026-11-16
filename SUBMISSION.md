# Submission: Ajaia AI-Native Full Stack Developer Assignment

**Candidate:** Sadiksha Chitrakar · sadiksha.chitrakar101@gmail.com

## Links
- **Live app:** https://ajaia-assessment-rosy-six.vercel.app
- **Walkthrough video:** in `VIDEO_URL.txt`
- **Github:** https://github.com/sadikshachitrakar/AJAIA_Assessment

## Test accounts# Submission: Ajaia AI-Native Full Stack Developer Assignment

**Candidate:** [Your name] · [your email]
**Time spent:** about 4 hours

## Links
- **Live app:** https://ajaia-assessment-rosy-six.vercel.app
- **Walkthrough video:** in `WALKTHROUGH.txt`

## Test accounts
No passwords: pick a user on the login page. Use **Switch user** in the
header to change accounts.

| User | Email | Use it to see |
|---|---|---|
| Alice | alice@demo.com | Owner: create, import, rename, share, change roles, delete |
| Bob | bob@demo.com | Shared documents: one he can edit, one he can only view |
| Carol | carol@demo.com | No access: Alice's document URLs show "Document not found" |

## 3-minute review path
1. Sign in as Alice → **New document** → rename it, add a heading, bold
   text and a list → refresh. Everything is still there.
2. **Import file** → pick a file from `sample-files/` (.md, .txt or .docx).
3. **Share** the document with bob@demo.com as Editor.
4. **Switch user** → Bob: the document is under "Shared with me" and he
   can edit it. Open the document marked "Can view" to see read-only mode.
5. **Switch user** → Carol: paste the document's URL → "Document not found".

## What's in this folder
| Item | What it is |
|---|---|
| Source code | The full project (no `node_modules` or secrets; `.env.example` included). Contains `screenshots/` (8 key screens) and `sample-files/` (files for trying the import) |
| `README.md` | Local setup, test commands, access rules |
| `ARCHITECTURE.md` | Implementation decisions, tradeoffs, next steps |
| `AI_WORKFLOW.md` | How I used AI and verified its work |
| `SUBMISSION.md` | This index |
| `WALKTHROUGH.txt` | Walkthrough video link |

## Status
**Working end to end on the live site:** creating, renaming and editing
documents with rich text; autosave and persistence; importing .txt, .md
and .docx files; sharing, with owned and shared documents shown
separately; changing roles and removing access.

**Stretch (from the brief's optional list):** role-based sharing with
Viewer and Editor roles.

**Not built:** real-time co-editing (the last save wins), real login,
revision history, a caching layer, and images or tables in documents.

**Next 2–4 hours:**
1. Stop silent overwrites: send the document's version with each save
   and reject stale saves with a 409 (~1 h)
2. Revision history: throttled snapshots with restore (~1–2 h)
3. Real login with Auth.js magic links (~1 h)
4. Separate dev database and CI that runs tests on every push (~30 min)

## Notes for reviewers
- The live database is shared between reviewers. The review path creates
  its own documents, so it works even if someone else changed the seed
  data.
- The first request after a quiet period can take a few seconds while
  the database wakes up.
No passwords: pick a user on the login page. Use **Switch user** in
the header to change accounts.

| User | Email | Use it to see |
|---|---|---|
| Alice | alice@demo.com | Owner: create, import, rename, share, delete |
| Bob | bob@demo.com | Shared documents: editor on *Welcome to Docs*, viewer on *Team Handbook* |
| Carol | carol@demo.com | No access: Alice's document URLs return "not found" |

## 3-minute review path
1. Sign in as Alice → **New document** → rename it, add a heading, bold
   text and a list → refresh. Everything is still there.
2. Import a file from `sample-files/` (.md, .txt or .docx).
3. Share the document with bob@demo.com as **Can edit**.
4. **Switch user** → Bob: it's under "Shared with me". He can edit it,
   but can't rename, share or delete it.
5. Still as Bob, open *Team Handbook (view only)*: a "Can view" badge,
   no toolbar, and the content can't be changed.
6. **Switch user** → Carol: paste the document's URL → "Document not found".

## What's in the Google Drive folder
| Item | Contents |
|---|---|
| `source/` | Full source code, same as the GitHub repo (no `node_modules` or secrets; `.env.example` included) |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | What I prioritized and why, key decisions, next steps |
| `AI_WORKFLOW.md` | AI tools, where they helped, what I changed or rejected, how I verified |
| `SUBMISSION.md` | This file |
| `VIDEO_URL.txt` | Walkthrough video link |
| `screenshots/` | Key screens |
| `sample-files/` | Files for testing import |

## Status
**Working end to end:** document creation, renaming and rich-text
editing; autosave and persistence; file import (.txt, .md, .docx);
sharing with a clear owned/shared distinction, plus viewer/editor
roles (the optional stretch); live deployment; 54 automated tests.

**Not built:** real-time co-editing (last write wins), real
authentication, comments, version history, export.
