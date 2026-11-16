import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/api";
import { listDocumentsForUser } from "@/lib/documents";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listDocumentsForUser(auth.value.id));
}

export async function POST() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  const doc = await prisma.document.create({
    data: { title: "Untitled document", content: "", ownerId: auth.value.id },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(doc, { status: 201 });
}
