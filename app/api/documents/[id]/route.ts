import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, notFound, parseJson, requireApiUser } from "@/lib/api";
import { findDocumentForUser } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { UpdateDocumentSchema } from "@/lib/validation";

type Ctx = RouteContext<"/api/documents/[id]">;

export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const found = await findDocumentForUser((await params).id, auth.value.id);
  if (!found || !can(found.role, "view")) return notFound();
  return NextResponse.json({ ...found.document, role: found.role });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const found = await findDocumentForUser((await params).id, auth.value.id);
  if (!found) return notFound();

  const body = await parseJson(request, UpdateDocumentSchema);
  if (!body.ok) return body.response;
  const { title, content } = body.value;

  // The user can see the doc, so 403 (not 404) for actions their role lacks.
  if (title !== undefined && !can(found.role, "rename")) {
    return jsonError(403, "Only the owner can rename this document");
  }
  if (content !== undefined && !can(found.role, "edit")) {
    return jsonError(403, "You don't have permission to edit this document");
  }

  const updated = await prisma.document.update({
    where: { id: found.document.id },
    data: { title, content },
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const found = await findDocumentForUser((await params).id, auth.value.id);
  if (!found) return notFound();
  if (!can(found.role, "delete")) return jsonError(403, "Only the owner can delete this document");

  await prisma.document.delete({ where: { id: found.document.id } });
  return new NextResponse(null, { status: 204 });
}
