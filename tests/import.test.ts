import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { prepareImport } from "@/lib/import";
import { IMPORT_MAX_BYTES, checkImportFile, titleFromFileName } from "@/lib/import-rules";

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "fixtures", name));

/** Import a fixture file from disk as if it were uploaded under `name`. */
function importFixture(file: string, name = file) {
  const buf = fixture(file);
  return prepareImport({ name, size: buf.length, read: async () => buf });
}

/** Ignore formatting whitespace between tags so assertions focus on structure. */
const compact = (html: string) => html.replace(/>\s+</g, "><");

describe("prepareImport: conversion", () => {
  it("converts markdown heading, bold, and list to editor HTML", async () => {
    const result = await importFixture("notes.md");
    expect(result).toMatchObject({ ok: true, title: "notes" });
    if (!result.ok) return;
    expect(compact(result.html)).toBe(
      "<h1>Meeting Notes</h1>" +
        "<p>Some <strong>bold</strong> text and <em>italic</em> text.</p>" +
        "<ul><li>First item</li><li>Second item</li></ul>",
    );
  });

  it("imports .txt markup as escaped text, never as HTML", async () => {
    const result = await importFixture("script.txt");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).not.toMatch(/<script/i);
    expect(result.html).toContain("&lt;script&gt;alert(\"xss\")&lt;/script&gt;");
    // Blank line → new paragraph; single newline → <br>; & is escaped.
    expect(result.html).toMatch(/^<p>Hello .* world<br \/>second line &amp; more<\/p><p>New paragraph<\/p>$/);
  });

  it("converts .docx headings, marks (incl. underline), and lists; flattens tables to text", async () => {
    const result = await importFixture("report.docx");
    expect(result).toMatchObject({ ok: true, title: "report" });
    if (!result.ok) return;
    expect(result.html).toContain("<h1>Quarterly Report</h1>");
    expect(result.html).toContain("<strong>strong</strong>");
    expect(result.html).toContain("<em>flat</em>");
    expect(result.html).toContain("<u>improved</u>"); // requires the "u => u" style map
    expect(result.html).toContain("<ul><li>New customers</li><li>Lower churn</li></ul>");
    expect(result.html).toContain("<ol><li>Hire</li><li>Ship</li></ol>");
    expect(result.html).not.toContain("<table");
    expect(result.html).toContain("Cell A");
  });

  it("matches extensions case-insensitively", async () => {
    const result = await importFixture("notes.md", "NOTES.MD");
    expect(result).toMatchObject({ ok: true, title: "NOTES" });
  });
});

describe("prepareImport: rejections", () => {
  it("rejects an unsupported extension without reading the file", async () => {
    const read = vi.fn();
    const result = await prepareImport({ name: "slides.pdf", size: 1000, read });
    expect(result).toEqual({ ok: false, error: "Unsupported file type (.pdf). Use .txt, .md, or .docx." });
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects a file with no extension, including dotfiles like '.md'", () => {
    expect(checkImportFile({ name: "README", size: 10 })).toMatchObject({ ok: false });
    expect(checkImportFile({ name: ".md", size: 10 })).toMatchObject({ ok: false });
  });

  it("rejects an oversized file without reading it", async () => {
    const read = vi.fn();
    const result = await prepareImport({ name: "big.txt", size: IMPORT_MAX_BYTES + 1, read });
    expect(result).toEqual({ ok: false, error: "File is too large (2.1 MB). The limit is 2 MB." });
    expect(read).not.toHaveBeenCalled();
  });

  it("accepts a file of exactly 2 MB", () => {
    expect(checkImportFile({ name: "max.txt", size: IMPORT_MAX_BYTES })).toEqual({ ok: true, ext: ".txt" });
  });

  it("rejects an empty file", async () => {
    const result = await prepareImport({ name: "empty.md", size: 0, read: async () => Buffer.alloc(0) });
    expect(result).toEqual({ ok: false, error: "The file is empty." });
  });

  it("rejects a file with no readable text", async () => {
    const buf = Buffer.from("  \n\n  \n");
    const result = await prepareImport({ name: "blank.txt", size: buf.length, read: async () => buf });
    expect(result).toEqual({ ok: false, error: "No readable text found in this file." });
  });

  it("rejects a corrupt .docx with a clear message", async () => {
    const buf = Buffer.from("this is not a zip archive");
    const result = await prepareImport({ name: "broken.docx", size: buf.length, read: async () => buf });
    expect(result).toEqual({ ok: false, error: "Couldn't read this .docx file" });
  });
});

describe("titleFromFileName", () => {
  it.each([
    ["notes.md", "notes"],
    ["Q4 plan.final.docx", "Q4 plan.final"],
    ["C:\\Users\\me\\report.txt", "report"],
    ["  spaced  .txt", "spaced"],
    ["   .txt", "Untitled document"],
  ])("%s → %s", (input, expected) => {
    expect(titleFromFileName(input)).toBe(expected);
  });

  it("caps titles at 200 characters", () => {
    expect(titleFromFileName(`${"a".repeat(250)}.txt`)).toHaveLength(200);
  });
});
