import { PrismaClient, type ShareRole } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Idempotent demo data: safe to re-run any number of times.
 * Fixed ids + upserts mean no duplicates. Re-running resets sharing on the seed docs
 * to the state below, but leaves document content alone (reviewers' edits survive).
 */

const USERS = [
  { email: "alice@demo.com", name: "Alice" },
  { email: "bob@demo.com", name: "Bob" },
  { email: "carol@demo.com", name: "Carol" },
];

const DOCS: { id: string; title: string; content: string; bobRole: ShareRole }[] = [
  {
    id: "seed-welcome-doc",
    title: "Welcome to Docs",
    bobRole: "editor",
    content:
      "<h1>Welcome</h1><p>This document is owned by <strong>Alice</strong> and shared with <em>Bob</em> as an editor.</p>" +
      "<ul><li>Bob can edit the content</li><li>Only Alice can rename, share, or delete</li></ul>",
  },
  {
    id: "seed-viewer-doc",
    title: "Team Handbook (view only)",
    bobRole: "viewer",
    content:
      "<h1>Team Handbook</h1><p>Alice shared this with <em>Bob</em> as a <strong>viewer</strong>.</p>" +
      "<ul><li>Bob can read it but not change it</li><li>Carol has no access at all</li></ul>",
  },
];

async function main() {
  const [alice, bob, carol] = await Promise.all(
    USERS.map((u) => prisma.user.upsert({ where: { email: u.email }, update: { name: u.name }, create: u })),
  );

  for (const doc of DOCS) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: { ownerId: alice.id },
      create: { id: doc.id, title: doc.title, content: doc.content, ownerId: alice.id },
    });

    await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: bob.id } },
      update: { role: doc.bobRole },
      create: { documentId: doc.id, userId: bob.id, role: doc.bobRole },
    });

    // Carol must stay a stranger to the seed docs, even if a reviewer shared them with her.
    await prisma.documentShare.deleteMany({ where: { documentId: doc.id, userId: carol.id } });
  }

  console.log(`Seeded ${USERS.length} users; ${DOCS.map((d) => `"${d.title}" (Bob: ${d.bobRole})`).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
