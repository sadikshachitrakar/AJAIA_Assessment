import { describe, expect, it } from "vitest";
import { hasText, sanitizeDocumentHtml } from "@/lib/sanitize";

describe("sanitizeDocumentHtml", () => {
  it("removes <script> elements and their contents", () => {
    expect(sanitizeDocumentHtml("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>");
  });

  it("strips event-handler attributes like onclick", () => {
    expect(sanitizeDocumentHtml('<p onclick="steal()">Click</p>')).toBe("<p>Click</p>");
  });

  it("removes <img> (including onerror payloads)", () => {
    expect(sanitizeDocumentHtml('<p>A<img src="x" onerror="alert(1)">B</p>')).toBe("<p>AB</p>");
  });

  it("strips all attributes, including style, class, and href", () => {
    expect(sanitizeDocumentHtml('<p style="color:red" class="x"><strong id="y">Bold</strong></p>')).toBe(
      "<p><strong>Bold</strong></p>",
    );
  });

  it("unwraps unsupported tags but keeps their text", () => {
    expect(sanitizeDocumentHtml('<div><p>See <a href="javascript:alert(1)">this link</a></p></div>')).toBe(
      "<p>See this link</p>",
    );
    expect(sanitizeDocumentHtml("<table><tr><td>Cell</td></tr></table>")).toBe("Cell");
  });

  it("keeps every tag the editor supports", () => {
    const html =
      "<h1>a</h1><h2>b</h2><h3>c</h3><p><strong>d</strong><b>e</b><em>f</em><i>g</i><u>h</u><br /></p>" +
      "<ul><li>i</li></ul><ol><li>j</li></ol>";
    expect(sanitizeDocumentHtml(html)).toBe(html);
  });

  it("maps h4–h6 to h3, since the editor only has three heading levels", () => {
    expect(sanitizeDocumentHtml("<h4>Deep</h4><h6>Deeper</h6>")).toBe("<h3>Deep</h3><h3>Deeper</h3>");
  });

  it("drops <style> contents and HTML comments", () => {
    expect(sanitizeDocumentHtml("<style>p{}</style><!-- note --><p>Text</p>")).toBe("<p>Text</p>");
  });
});

describe("sanitizeDocumentHtml: storage safety", () => {
  it("removes NUL bytes, which Postgres text columns reject", () => {
    expect(sanitizeDocumentHtml("<p>a\u0000b</p>")).toBe("<p>ab</p>");
  });
});

describe("hasText", () => {
  it("is false for markup with no visible text", () => {
    expect(hasText("<p></p><p><br /></p>")).toBe(false);
  });
  it("is true when any text remains", () => {
    expect(hasText("<p><strong>x</strong></p>")).toBe(true);
  });
});
