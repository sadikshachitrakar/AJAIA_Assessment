# Submission: Ajaia AI-Native Full Stack Developer Assignment

**Candidate:** [Your Name] · [your email]

## Links
- **Live app:** https://ajaia-assessment-rosy-six.vercel.app
- **Walkthrough video:** in `VIDEO_URL.txt`
- **Source code:** `source/` in this folder

## Test accounts
No passwords: pick a user on the login page. Use **Switch user** in
the header to change accounts.

| User | Email | Use it to see |
|---|---|---|
| Alice | alice@demo.com | Owner: create, import, rename, share, delete |
| Bob | bob@demo.com | Documents shared with him [as editor and as viewer] |
| Carol | carol@demo.com | No access: Alice's document URLs return "not found" |

## 3-minute review path
1. Sign in as Alice → **New document** → rename it, add a heading, bold
   text and a list → refresh. Everything is still there.
2. Import a file from `sample-files/` (.md, .txt or .docx).
3. Share the document with bob@demo.com.
4. **Switch user** → Bob: it's under "Shared with me". He can edit it,
   but can't rename, share or delete it.
5. **Switch user** → Carol: paste the document's URL → "Document not found".

## What's in this folder
| Item | Contents |
|---|---|
| `source/` | Full source code (no `node_modules` or secrets; `.env.example` included) |
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
sharing with a clear owned/shared distinction [and viewer/editor
roles]; live deployment; automated tests.

**Not built:** real-time co-editing (last write wins), real
authentication, comments, version history, export.
