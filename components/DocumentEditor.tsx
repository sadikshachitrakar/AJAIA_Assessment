"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Collaborator } from "@/lib/documents";
import type { Role } from "@/lib/permissions";
import { EditorToolbar } from "./EditorToolbar";
import { ShareDialog } from "./ShareDialog";
import { TitleInput } from "./TitleInput";
import { useAutosave, type SaveStatus } from "./useAutosave";

type Props = {
  document: { id: string; title: string; content: string; owner: { name: string } };
  role: Role;
  collaborators: Collaborator[];
};

const ROLE_LABEL: Record<Role, string> = { owner: "Owner", editor: "Can edit" };

export function DocumentEditor({ document: doc, role, collaborators }: Props) {
  const autosave = useAutosave(`/api/documents/${doc.id}`);
  const isOwner = role === "owner";

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch
    extensions: [
      // Only the formats the toolbar supports — this also disables their shortcuts/input rules.
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: false,
      }),
    ],
    content: doc.content,
    editorProps: {
      attributes: { class: "doc-content", "aria-label": "Document content", role: "textbox", "aria-multiline": "true" },
    },
    // Fires on user edits only (not on initial content), so loading never triggers a save.
    onUpdate: ({ editor }) => autosave.schedule(editor.getHTML()),
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-2">
          <Link href="/" className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100" aria-label="Back to documents">
            ← Docs
          </Link>
          <TitleInput documentId={doc.id} initialTitle={doc.title} editable={isOwner} />
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              isOwner ? "bg-blue-50 text-blue-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {ROLE_LABEL[role]}
          </span>
          {!isOwner && <span className="shrink-0 text-xs text-gray-500">Owned by {doc.owner.name}</span>}
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <SaveIndicator status={autosave.status} error={autosave.error} onRetry={autosave.retry} />
            {isOwner && <ShareDialog documentId={doc.id} initialCollaborators={collaborators} />}
            {isOwner && <DeleteButton documentId={doc.id} />}
          </div>
        </div>
        <div className="border-t border-gray-100 px-4 py-1.5">
          {editor ? <EditorToolbar editor={editor} /> : <div className="h-8" />}
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto min-h-[70vh] w-full max-w-[816px] rounded-sm bg-white px-12 py-10 shadow-sm ring-1 ring-gray-200 sm:px-16">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}

function SaveIndicator({ status, error, onRetry }: { status: SaveStatus; error: string | null; onRetry: () => void }) {
  if (status === "error") {
    return (
      <span role="alert" className="flex items-center gap-2 text-sm text-red-600" title={error ?? undefined}>
        Couldn&apos;t save
        <button type="button" onClick={onRetry} className="rounded border border-red-300 px-2 py-0.5 text-xs hover:bg-red-50">
          Retry
        </button>
      </span>
    );
  }
  const label = { idle: "", pending: "Saving…", saving: "Saving…", saved: "Saved" }[status];
  return (
    <span aria-live="polite" className="min-w-16 text-right text-sm text-gray-500">
      {label}
    </span>
  );
}

function DeleteButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Delete this document? This can't be undone.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setBusy(false);
      setError("Couldn't delete");
    }
  }

  return (
    <span className="flex items-center gap-2">
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded border border-gray-300 px-2.5 py-1 text-sm text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </span>
  );
}
