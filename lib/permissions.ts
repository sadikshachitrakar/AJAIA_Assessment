// Pure access rules — no DB, no framework imports, so they're trivially unit-testable.

export type Role = "owner" | "editor";
export type Action = "view" | "edit" | "rename" | "share" | "delete";

export type DocumentAccessInfo = {
  ownerId: string;
  sharedUserIds: readonly string[];
};

const ALLOWED: Record<Role, ReadonlySet<Action>> = {
  owner: new Set<Action>(["view", "edit", "rename", "share", "delete"]),
  editor: new Set<Action>(["view", "edit"]),
};

/** The user's role on a document, or null if they have no access at all. */
export function getRole(doc: DocumentAccessInfo, userId: string): Role | null {
  if (doc.ownerId === userId) return "owner";
  if (doc.sharedUserIds.includes(userId)) return "editor";
  return null;
}

export function can(role: Role | null, action: Action): boolean {
  return role !== null && ALLOWED[role].has(action);
}
