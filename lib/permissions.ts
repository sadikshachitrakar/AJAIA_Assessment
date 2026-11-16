// Pure access rules — no DB, no framework imports, so they're trivially unit-testable.

/** Role granted through a share. Mirrors the Prisma `ShareRole` enum. */
export type ShareRole = "viewer" | "editor";
export const SHARE_ROLES = ["viewer", "editor"] as const satisfies readonly ShareRole[];

/** A user's effective role on a document. */
export type Role = "owner" | ShareRole;
export type Action = "view" | "edit" | "rename" | "share" | "delete";

export type DocumentAccessInfo = {
  ownerId: string;
  shares: readonly { userId: string; role: ShareRole }[];
};

const ALLOWED: Record<Role, ReadonlySet<Action>> = {
  owner: new Set<Action>(["view", "edit", "rename", "share", "delete"]),
  editor: new Set<Action>(["view", "edit"]),
  viewer: new Set<Action>(["view"]),
};

/** The user's role on a document, or null if they have no access at all. */
export function getRole(doc: DocumentAccessInfo, userId: string): Role | null {
  if (doc.ownerId === userId) return "owner";
  return doc.shares.find((s) => s.userId === userId)?.role ?? null;
}

export function can(role: Role | null, action: Action): boolean {
  return role !== null && ALLOWED[role].has(action);
}

export const ROLE_LABEL: Record<Role, string> = { owner: "Owner", editor: "Can edit", viewer: "Can view" };
