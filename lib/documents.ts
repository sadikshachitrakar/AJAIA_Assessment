import "server-only";
import { prisma } from "@/lib/db";
import { getRole, type Role } from "@/lib/permissions";

const documentSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, email: true } },
  shares: { select: { userId: true } },
} as const;

/**
 * Loads a document and the caller's role on it.
 * Returns null both when the doc doesn't exist and when the user has no access,
 * so callers respond 404 in either case and never reveal that the doc exists.
 */
export async function findDocumentForUser(id: string, userId: string) {
  const doc = await prisma.document.findUnique({ where: { id }, select: documentSelect });
  if (!doc) return null;
  const role = getRole({ ownerId: doc.ownerId, sharedUserIds: doc.shares.map((s) => s.userId) }, userId);
  if (!role) return null;
  const { id: docId, title, content, ownerId, owner, createdAt, updatedAt } = doc;
  return { document: { id: docId, title, content, ownerId, owner, createdAt, updatedAt }, role };
}

export type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  owner: { id: string; name: string };
};

export async function listDocumentsForUser(userId: string) {
  const summary = {
    id: true,
    title: true,
    updatedAt: true,
    owner: { select: { id: true, name: true } },
  } as const;

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, select: summary }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: summary,
    }),
  ]);
  return { owned, shared } satisfies Record<string, DocumentSummary[]>;
}

export type { Role };
