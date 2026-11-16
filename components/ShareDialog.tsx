"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Collaborator } from "@/lib/documents";
import type { ShareRole } from "@/lib/permissions";

const ROLE_OPTIONS: { value: ShareRole; label: string }[] = [
  { value: "editor", label: "Can edit" },
  { value: "viewer", label: "Can view" },
];

type Props = { documentId: string; initialCollaborators: Collaborator[] };

async function errorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

export function ShareDialog({ documentId, initialCollaborators }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<ShareRole>("editor");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null); // shared by remove + role change
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Couldn't share document"));
      const added = (await res.json()) as Collaborator;
      setCollaborators((list) => [...list, added]);
      setEmail("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Couldn't share document");
    } finally {
      setAdding(false);
    }
  }

  async function onChangeRole(user: Collaborator, role: ShareRole) {
    if (role === user.role) return;
    setUpdatingId(user.id);
    setRemoveError(null);
    const setRole = (r: ShareRole) =>
      setCollaborators((list) => list.map((c) => (c.id === user.id ? { ...c, role: r } : c)));
    setRole(role); // optimistic
    try {
      const res = await fetch(`/api/documents/${documentId}/share/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, `Couldn't change ${user.name}'s access`));
    } catch (err) {
      setRole(user.role); // roll back
      setRemoveError(err instanceof Error ? err.message : `Couldn't change ${user.name}'s access`);
    } finally {
      setUpdatingId(null);
    }
  }

  async function onRemove(user: Collaborator) {
    setRemovingId(user.id);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await errorMessage(res, `Couldn't remove ${user.name}`));
      setCollaborators((list) => list.filter((c) => c.id !== user.id));
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : `Couldn't remove ${user.name}`);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal();
          emailRef.current?.focus(); // showModal() would otherwise focus the first button (Close)
        }}
        className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
      >
        Share{collaborators.length > 0 && ` · ${collaborators.length}`}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="share-title"
        className="m-auto w-full max-w-md rounded-xl p-0 shadow-xl backdrop:bg-black/30"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h2 id="share-title" className="text-lg font-semibold text-gray-900">Share document</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="-mr-2 -mt-1 rounded px-2 text-xl leading-none text-gray-500 hover:bg-gray-100"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">Editors can change the content; viewers can only read it.</p>

          <form onSubmit={onAdd} className="mt-4 flex gap-2">
            <label htmlFor="share-email" className="sr-only">Email address</label>
            <input
              ref={emailRef}
              id="share-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (addError) setAddError(null);
              }}
              placeholder="name@demo.com"
              aria-invalid={!!addError}
              aria-describedby={addError ? "share-error" : undefined}
              className={`min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-blue-500 ${
                addError ? "border-red-400" : "border-gray-300"
              }`}
            />
            <label htmlFor="share-role" className="sr-only">Access</label>
            <select
              id="share-role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as ShareRole)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding || email.trim() === ""}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </form>
          {addError && (
            <p id="share-error" role="alert" className="mt-2 text-sm text-red-600">{addError}</p>
          )}

          <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-500">
            People with access
          </h3>
          {collaborators.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Not shared with anyone yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-gray-100">
              {collaborators.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                    {c.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900">{c.name}</span>
                    <span className="block truncate text-xs text-gray-500">{c.email}</span>
                  </span>
                  <select
                    value={c.role}
                    onChange={(e) => onChangeRole(c, e.target.value as ShareRole)}
                    disabled={updatingId === c.id || removingId === c.id}
                    aria-label={`Access for ${c.name}`}
                    className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-700 disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onRemove(c)}
                    disabled={removingId === c.id}
                    aria-label={`Remove ${c.name}`}
                    className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    {removingId === c.id ? "Removing…" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {removeError && <p role="alert" className="mt-2 text-sm text-red-600">{removeError}</p>}
        </div>
      </dialog>
    </>
  );
}
