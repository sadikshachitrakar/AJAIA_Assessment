"use client";

import { useState } from "react";
import { readError } from "@/lib/http";
import { TITLE_MAX, TitleSchema } from "@/lib/validation";

type Props = { documentId: string; initialTitle: string; editable: boolean };

export function TitleInput({ documentId, initialTitle, editable }: Props) {
  const [value, setValue] = useState(initialTitle);
  const [saved, setSaved] = useState(initialTitle);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!editable) {
    return <h1 className="truncate px-2 py-1 text-lg font-medium text-gray-900">{initialTitle}</h1>;
  }

  async function commit() {
    const parsed = TitleSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid title");
      return;
    }
    const title = parsed.data;
    setValue(title);
    if (title === saved) {
      setError(null);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(await readError(res, "Couldn't rename document"));
      setSaved(title);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't rename document");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 flex-1">
      <input
        value={value}
        maxLength={TITLE_MAX + 50 /* let the user overshoot so validation can explain */}
        aria-label="Document title"
        aria-invalid={!!error}
        aria-describedby={error ? "title-error" : undefined}
        disabled={saving}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur(); // blur → commit
          if (e.key === "Escape") {
            setValue(saved);
            setError(null);
            requestAnimationFrame(() => (e.target as HTMLInputElement).blur());
          }
        }}
        className={`w-full max-w-xl truncate rounded border px-2 py-1 text-lg font-medium text-gray-900 outline-none ${
          error ? "border-red-400 bg-red-50" : "border-transparent hover:border-gray-300 focus:border-blue-500"
        }`}
      />
      {error && (
        <p id="title-error" role="alert" className="mt-1 px-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
