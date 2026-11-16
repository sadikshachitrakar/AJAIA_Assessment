"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { IMPORT_ACCEPT, checkImportFile } from "@/lib/import-rules";

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again after an error
    if (!file) return;

    // Fast feedback in the browser; the server re-checks everything.
    const check = checkImportFile(file);
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: form });
      const body = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok || !body?.id) throw new Error(body?.error ?? "Import failed. Please try again.");
      router.push(`/documents/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        onChange={onChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-describedby="import-hint"
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        {busy ? "Importing…" : "Import file"}
      </button>
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
