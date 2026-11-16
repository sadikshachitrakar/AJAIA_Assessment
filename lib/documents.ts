import "server-only";
import { prisma } from "@/lib/db";
import { getRole, type Role } from "@/lib/permissions";

export type Collaborator = { id: string; name: string; email: string };

const documentSelect = {
  id: true,
  title: true,
  content: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, name: true, email: true } },
  shares: {
    orderBy: { createdAt: "asc" },
    select: { user: { select: { id: true, name: true, email: true } } },
  },
} as const;

/**
 * Loads a document, the caller's role, and its collaborators.
 * Returns null both when the doc doesn't exist and when the user has no access,
 * so callers respond 404 in either case and never reveal that the doc exists.
 */
export async function findDocumentForUser(id: string, userId: string) {
  const doc = await prisma.document.findUnique({ where: { id }, select: documentSelect });
  if (!doc) return null;

  const collaborators: Collaborator[] = doc.shares.map((s) => s.user);
  const role = getRole({ ownerId: doc.ownerId, sharedUserIds: collaborators.map((c) => c.id) }, userId);
  if (!role) return null;

  const { id: docId, title, content, ownerId, owner, createdAt, updatedAt } = doc;
  return {
    document: { id: docId, title, content, ownerId, owner, createdAt, updatedAt },
    role,
    collaborators,
  };
}

export type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  owner: { id: string; name: string };
  collaboratorCount: number;
};

const summarySelect = {
  id: true,
  title: true,
  updatedAt: true,
  owner: { select: { id: true, name: true } },
  _count: { select: { shares: true } },
} as const;

export async function listDocumentsForUser(userId: string) {
  const [owned, shared] = await Promise.all([
    prisma.document.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, select: summarySelect }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: summarySelect,
    }),
  ]);
  const toSummary = ({ _count, ...d }: (typeof owned)[number]): DocumentSummary => ({
    ...d,
    collaboratorCount: _count.shares,
  });
  return { owned: owned.map(toSummary), shared: shared.map(toSummary) };
}

export type { Role };
