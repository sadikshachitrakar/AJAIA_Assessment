import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireApiUser } from "@/lib/api";
import { prepareImport } from "@/lib/import";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "Expected a multipart form upload");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "Choose a file to import");

  const result = await prepareImport({
    name: file.name,
    size: file.size,
    read: async () => Buffer.from(await file.arrayBuffer()),
  });
  if (!result.ok) return jsonError(400, result.error);

  const doc = await prisma.document.create({
    data: { title: result.title, content: result.html, ownerId: auth.value.id },
    select: { id: true, title: true },
  });
  return NextResponse.json(doc, { status: 201 });
}
