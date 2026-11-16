import sanitizeHtml from "sanitize-html";

/** Exactly the markup the editor supports. Everything else is unwrapped (text kept). */
export const ALLOWED_TAGS = ["p", "h1", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "br"];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {}, // no attributes at all: kills onclick, style, href, src, …
  disallowedTagsMode: "discard", // drop the tag, keep its text
  // Contents of these are dropped entirely (not shown as text).
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "title", "head"],
  // The editor only has 3 heading levels; keep deeper headings as headings.
  transformTags: { h4: "h3", h5: "h3", h6: "h3" },
};

export function sanitizeDocumentHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

/** True if the HTML has any visible text. */
export function hasText(html: string): boolean {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim().length > 0;
}
