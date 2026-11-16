import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, notFound, parseJson, requireApiUser } from "@/lib/api";
import { findDocumentForUser, type Collaborator } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { UpdateShareSchema } from "@/lib/validation";

type Ctx = RouteContext<"/api/documents/[id]/share/[userId]">;

/** Shared preamble: auth → 404 if no access → 403 unless the caller can manage sharing. */
async function loadForOwner(params: Ctx["params"]) {
  const auth = await requireApiUser();
  if (!auth.ok) return { ok: false as const, response: auth.response };

  const { id, userId } = await params;
  const found = await findDocumentForUser(id, auth.value.id);
  if (!found) return { ok: false as const, response: notFound() };
  if (!can(found.role, "share")) {
    return { ok: false as const, response: jsonError(403, "Only the owner can manage sharing") };
  }
  return { ok: true as const, found, userId };
}

export async function PATCH(request: Request, { params }: Ctx) {
  const ctx = await loadForOwner(params);
  if (!ctx.ok) return ctx.response;

  const body = await parseJson(request, UpdateShareSchema);
  if (!body.ok) return body.response;

  const collaborator = ctx.found.collaborators.find((c) => c.id === ctx.userId);
  if (!collaborator) return jsonError(404, "That user is not a collaborator");

  await prisma.documentShare.update({
    where: { documentId_userId: { documentId: ctx.found.document.id, userId: ctx.userId } },
    data: { role: body.value.role },
  });
  return NextResponse.json({ ...collaborator, role: body.value.role } satisfies Collaborator);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const ctx = await loadForOwner(params);
  if (!ctx.ok) return ctx.response;

  const { count } = await prisma.documentShare.deleteMany({
    where: { documentId: ctx.found.document.id, userId: ctx.userId },
  });
  if (count === 0) return jsonError(404, "That user is not a collaborator");
  return new NextResponse(null, { status: 204 });
}
