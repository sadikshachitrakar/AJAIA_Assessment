import "server-only";
import { prisma } from "@/lib/db";
import { getRole, type Role, type ShareRole } from "@/lib/permissions";

export type Collaborator = { id: string; name: string; email: string; role: ShareRole };

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
    select: { role: true, user: { select: { id: true, name: true, email: true } } },
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

  const collaborators: Collaborator[] = doc.shares.map((s) => ({ ...s.user, role: s.role }));
  const role = getRole(
    { ownerId: doc.ownerId, shares: collaborators.map((c) => ({ userId: c.id, role: c.role })) },
    userId,
  );
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
  /** The current user's role on this document. */
  role: Role;
};

export async function listDocumentsForUser(userId: string) {
  const base = {
    id: true,
    title: true,
    updatedAt: true,
    owner: { select: { id: true, name: true } },
    _count: { select: { shares: true } },
  } as const;

  const [owned, shared] = await Promise.all([
    prisma.document.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, select: base }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      // Only the caller's own share row, to read their role.
      select: { ...base, shares: { where: { userId }, select: { role: true } } },
    }),
  ]);

  return {
    owned: owned.map(({ _count, ...d }): DocumentSummary => ({
      ...d,
      collaboratorCount: _count.shares,
      role: "owner",
    })),
    shared: shared.map(({ _count, shares, ...d }): DocumentSummary => ({
      ...d,
      collaboratorCount: _count.shares,
      role: shares[0]?.role ?? "viewer", // the where-clause guarantees one row; fall back to least privilege
    })),
  };
}

export type { Role };
