import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, notFound, requireApiUser } from "@/lib/api";
import { findDocumentForUser } from "@/lib/documents";
import { can } from "@/lib/permissions";

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]/share/[userId]">,
) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const { id, userId } = await params;
  const found = await findDocumentForUser(id, auth.value.id);
  if (!found) return notFound();
  if (!can(found.role, "share")) return jsonError(403, "Only the owner can manage sharing");

  const { count } = await prisma.documentShare.deleteMany({
    where: { documentId: found.document.id, userId },
  });
  if (count === 0) return jsonError(404, "That user is not a collaborator");
  return new NextResponse(null, { status: 204 });
}
