"use client";

import { useEditorState, type Editor } from "@tiptap/react";

type Item = {
  key: string;
  label: string;
  title: string;
  className?: string;
  isActive: (e: Editor) => boolean;
  run: (e: Editor) => void;
};

const ITEMS: Item[] = [
  { key: "bold", label: "B", title: "Bold (⌘/Ctrl+B)", className: "font-bold",
    isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
  { key: "italic", label: "I", title: "Italic (⌘/Ctrl+I)", className: "italic font-serif",
    isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  { key: "underline", label: "U", title: "Underline (⌘/Ctrl+U)", className: "underline",
    isActive: (e) => e.isActive("underline"), run: (e) => e.chain().focus().toggleUnderline().run() },
  { key: "h1", label: "H1", title: "Heading 1 (⌘/Ctrl+Alt+1)",
    isActive: (e) => e.isActive("heading", { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { key: "h2", label: "H2", title: "Heading 2 (⌘/Ctrl+Alt+2)",
    isActive: (e) => e.isActive("heading", { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { key: "h3", label: "H3", title: "Heading 3 (⌘/Ctrl+Alt+3)",
    isActive: (e) => e.isActive("heading", { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { key: "bulletList", label: "• List", title: "Bulleted list (⌘/Ctrl+Shift+8)",
    isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: "orderedList", label: "1. List", title: "Numbered list (⌘/Ctrl+Shift+7)",
    isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
];

const GROUP_BREAKS = new Set(["h1", "bulletList"]);

export function EditorToolbar({ editor }: { editor: Editor }) {
  // Re-render only when an active state actually changes (TipTap v3 doesn't re-render per keystroke).
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => Object.fromEntries(ITEMS.map((i) => [i.key, i.isActive(e)])),
  });

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-1">
      {ITEMS.map((item) => (
        <span key={item.key} className="flex items-center">
          {GROUP_BREAKS.has(item.key) && <span aria-hidden className="mx-1 h-5 w-px bg-gray-300" />}
          <button
            type="button"
            title={item.title}
            aria-label={item.title}
            aria-pressed={active[item.key]}
            // Keep focus/selection in the editor when clicking toolbar buttons.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => item.run(editor)}
            className={`min-w-8 rounded px-2 py-1 text-sm transition-colors ${item.className ?? ""} ${
              active[item.key] ? "bg-blue-100 text-blue-800" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
}
