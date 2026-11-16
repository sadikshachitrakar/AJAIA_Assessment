import { describe, expect, it } from "vitest";
import { can, getRole, type Action, type Role } from "@/lib/permissions";

const OWNER = "user-alice";
const EDITOR = "user-bob";
const STRANGER = "user-carol";

const doc = { ownerId: OWNER, sharedUserIds: [EDITOR] };

describe("getRole", () => {
  it("returns 'owner' for the document owner", () => {
    expect(getRole(doc, OWNER)).toBe("owner");
  });

  it("returns 'editor' for a user the document is shared with", () => {
    expect(getRole(doc, EDITOR)).toBe("editor");
  });

  it("returns null for anyone else", () => {
    expect(getRole(doc, STRANGER)).toBeNull();
  });

  it("treats the owner as owner even if they also appear in the share list", () => {
    expect(getRole({ ownerId: OWNER, sharedUserIds: [OWNER] }, OWNER)).toBe("owner");
  });

  it("returns null for everyone but the owner when the doc is not shared", () => {
    const unshared = { ownerId: OWNER, sharedUserIds: [] };
    expect(getRole(unshared, OWNER)).toBe("owner");
    expect(getRole(unshared, EDITOR)).toBeNull();
  });
});

// Full matrix: every role × every action, so a new action can't silently default to "allowed".
const EXPECTED: Record<"owner" | "editor" | "stranger", Record<Action, boolean>> = {
  owner: { view: true, edit: true, rename: true, share: true, delete: true },
  editor: { view: true, edit: true, rename: false, share: false, delete: false },
  stranger: { view: false, edit: false, rename: false, share: false, delete: false },
};

const ROLE_OF: Record<keyof typeof EXPECTED, Role | null> = {
  owner: getRole(doc, OWNER),
  editor: getRole(doc, EDITOR),
  stranger: getRole(doc, STRANGER),
};

describe.each(Object.entries(EXPECTED))("can() for %s", (who, actions) => {
  it.each(Object.entries(actions))(`%s → %s`, (action, allowed) => {
    expect(can(ROLE_OF[who as keyof typeof EXPECTED], action as Action)).toBe(allowed);
  });
});
