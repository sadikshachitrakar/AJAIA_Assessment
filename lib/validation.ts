import { z } from "zod";
import { SHARE_ROLES } from "@/lib/permissions";

export const TITLE_MAX = 200;
export const CONTENT_MAX = 1_000_000; // ~1 MB of HTML

export const TitleSchema = z
  .string()
  .trim()
  .min(1, "Title can't be empty")
  .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`);

export const UpdateDocumentSchema = z
  .object({
    title: TitleSchema.optional(),
    content: z.string().max(CONTENT_MAX, "Document is too large").optional(),
  })
  .strict()
  .refine((b) => b.title !== undefined || b.content !== undefined, {
    message: "Provide a title or content to update",
  });

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;

const ShareRoleSchema = z.enum(SHARE_ROLES, { error: 'Role must be "viewer" or "editor"' });

export const ShareSchema = z
  .object({
    email: z.string({ error: "Email is required" }).trim().toLowerCase().pipe(z.email("Enter a valid email address")),
    role: ShareRoleSchema.default("editor"),
  })
  .strict();

export const UpdateShareSchema = z.object({ role: ShareRoleSchema }).strict();
