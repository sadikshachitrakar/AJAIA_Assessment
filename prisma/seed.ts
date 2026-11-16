import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_DOC_ID = "seed-welcome-doc";

async function main() {
  const [alice, bob] = await Promise.all(
    [
      { email: "alice@demo.com", name: "Alice" },
      { email: "bob@demo.com", name: "Bob" },
      { email: "carol@demo.com", name: "Carol" },
    ].map((u) =>
      prisma.user.upsert({ where: { email: u.email }, update: { name: u.name }, create: u }),
    ),
  );

  // Fixed id + upsert keeps the seed idempotent (safe to re-run).
  await prisma.document.upsert({
    where: { id: SAMPLE_DOC_ID },
    update: {},
    create: {
      id: SAMPLE_DOC_ID,
      title: "Welcome to Docs",
      ownerId: alice.id,
      content:
        "<h1>Welcome</h1><p>This document is owned by <strong>Alice</strong> and shared with <em>Bob</em>.</p><ul><li>Bob can edit the content</li><li>Only Alice can rename, share, or delete</li></ul>",
    },
  });

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: SAMPLE_DOC_ID, userId: bob.id } },
    update: {},
    create: { documentId: SAMPLE_DOC_ID, userId: bob.id },
  });

  console.log("Seeded: alice, bob, carol + 1 shared doc");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
