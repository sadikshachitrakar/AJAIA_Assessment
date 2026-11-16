import mammoth from "mammoth";
import { Marked } from "marked";
import { checkImportFile, titleFromFileName, type ImportExtension } from "@/lib/import-rules";
import { hasText, sanitizeDocumentHtml } from "@/lib/sanitize";

export type ImportResult = { ok: true; title: string; html: string } | { ok: false; error: string };

const markdown = new Marked({ gfm: true, async: false });

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Blank lines separate paragraphs; single newlines become <br>. */
export function textToHtml(text: string): string {
  return text
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.split("\n").map(escapeHtml).join("<br>")}</p>`)
    .join("");
}

export function markdownToHtml(md: string): string {
  return markdown.parse(md.replace(/^﻿/, "")) as string;
}

export async function docxToHtml(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: ["u => u"], // mammoth drops underline unless mapped explicitly
      externalFileAccess: false,
      // Images are stripped by the sanitizer anyway; don't base64-encode them first.
      convertImage: mammoth.images.imgElement(async () => ({ src: "" })),
    },
  );
  return value;
}

async function convert(ext: ImportExtension, buffer: Buffer): Promise<string> {
  switch (ext) {
    case ".txt":
      return textToHtml(new TextDecoder("utf-8").decode(buffer));
    case ".md":
      return markdownToHtml(new TextDecoder("utf-8").decode(buffer));
    case ".docx":
      return docxToHtml(buffer);
  }
}

/**
 * Validates, converts and sanitizes an uploaded file.
 * `read` is only called once name/size checks pass, so oversized files are never buffered.
 */
export async function prepareImport(file: {
  name: string;
  size: number;
  read: () => Promise<Buffer>;
}): Promise<ImportResult> {
  const check = checkImportFile(file);
  if (!check.ok) return check;

  let raw: string;
  try {
    raw = await convert(check.ext, await file.read());
  } catch {
    return {
      ok: false,
      error: check.ext === ".docx" ? "Couldn't read this .docx file" : "Couldn't read this file",
    };
  }

  const html = sanitizeDocumentHtml(raw);
  if (!hasText(html)) return { ok: false, error: "No readable text found in this file." };
  return { ok: true, title: titleFromFileName(file.name), html };
}
