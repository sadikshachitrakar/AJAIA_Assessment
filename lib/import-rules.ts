// Import constraints shared by the browser pre-check and the server.
// Keep this file free of Node-only dependencies so client components can import it.

export const IMPORT_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export type ImportExtension = (typeof IMPORT_EXTENSIONS)[number];

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** For the file picker. Extensions first: browser MIME types for .md are unreliable. */
export const IMPORT_ACCEPT = [
  ...IMPORT_EXTENSIONS,
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot).toLowerCase() : "";
}

export type ImportCheck = { ok: true; ext: ImportExtension } | { ok: false; error: string };

/** Validates name + size only (no content), by extension rather than MIME type. */
export function checkImportFile(file: { name: string; size: number }): ImportCheck {
  const ext = getExtension(file.name);
  if (!(IMPORT_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, error: `Unsupported file type${ext ? ` (${ext})` : ""}. Use .txt, .md, or .docx.` };
  }
  if (file.size === 0) return { ok: false, error: "The file is empty." };
  if (file.size > IMPORT_MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return { ok: false, error: `File is too large (${mb} MB). The limit is 2 MB.` };
  }
  return { ok: true, ext: ext as ImportExtension };
}

/** "Q4 notes.final.md" → "Q4 notes.final" (1–200 chars, falls back to "Untitled document"). */
export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/^.*[\\/]/, ""); // some browsers include a path
  const ext = getExtension(base);
  const title = (ext ? base.slice(0, -ext.length) : base).trim().slice(0, 200).trim();
  return title || "Untitled document";
}
