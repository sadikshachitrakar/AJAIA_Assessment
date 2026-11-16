import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

/** All API errors share the shape { error: string }. */
export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export const notFound = () => jsonError(404, "Document not found");

type Result<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

export async function requireApiUser(): Promise<Result<CurrentUser>> {
  const user = await getCurrentUser();
  return user ? { ok: true, value: user } : { ok: false, response: jsonError(401, "Unauthorized") };
}

export async function parseJson<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<Result<z.infer<S>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, response: jsonError(400, "Request body must be valid JSON") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, response: jsonError(400, parsed.error.issues[0]?.message ?? "Invalid request") };
  }
  return { ok: true, value: parsed.data };
}
