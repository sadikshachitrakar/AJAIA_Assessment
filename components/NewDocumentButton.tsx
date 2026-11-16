"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewDocumentButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      if (!res.ok) throw new Error();
      const doc = (await res.json()) as { id: string };
      router.push(`/documents/${doc.id}`);
    } catch {
      setError("Couldn't create a document. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={create}
        disabled={busy}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Creating…" : "+ New document"}
      </button>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
