import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError, notFound, parseJson, requireApiUser } from "@/lib/api";
import { findDocumentForUser, type Collaborator } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { ShareSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: RouteContext<"/api/documents/[id]/share">) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const found = await findDocumentForUser((await params).id, auth.value.id);
  if (!found) return notFound();
  if (!can(found.role, "share")) return jsonError(403, "Only the owner can share this document");

  const body = await parseJson(request, ShareSchema);
  if (!body.ok) return body.response;
  const { email, role } = body.value; // email already trimmed + lowercased; role defaults to editor

  if (email === auth.value.email.toLowerCase()) {
    return jsonError(400, "You already own this document");
  }
  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!target) return jsonError(400, "No user with that email");
  if (found.collaborators.some((c) => c.id === target.id)) {
    return jsonError(409, `Already shared with ${target.email}`);
  }

  try {
    await prisma.documentShare.create({ data: { documentId: found.document.id, userId: target.id, role } });
  } catch (e) {
    // Two concurrent requests can both pass the check above; the unique index decides.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, `Already shared with ${target.email}`);
    }
    throw e;
  }
  return NextResponse.json({ ...target, role } satisfies Collaborator, { status: 201 });
}
