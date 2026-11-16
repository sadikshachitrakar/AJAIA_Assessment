import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const ERRORS: Record<string, string> = {
  invalid: "Invalid login request.",
  unknown: "That user no longer exists.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // No redirect when signed in: this page doubles as the "Switch user" picker.
  const [current, { error }, users] = await Promise.all([
    getCurrentUser(),
    searchParams,
    prisma.user.findMany({ orderBy: { email: "asc" } }),
  ]);

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">{current ? "Switch user" : "Sign in"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {current ? (
            <>
              Signed in as {current.name}.{" "}
              <Link href="/" className="text-blue-600 hover:underline">Back to documents</Link>
            </>
          ) : (
            "Demo auth: pick a user to continue."
          )}
        </p>

        {typeof error === "string" && ERRORS[error] && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERRORS[error]}
          </p>
        )}

        <ul className="mt-5 space-y-2">
          {users.map((u) => (
            <li key={u.id}>
              <form action="/api/auth/login" method="post">
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                    {u.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-gray-900">
                      {u.name}
                      {current?.id === u.id && <span className="ml-1.5 text-xs font-normal text-gray-500">(current)</span>}
                    </span>
                    <span className="block text-xs text-gray-500">{u.email}</span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
        {users.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No users found. Run <code>npm run db:seed</code>.</p>
        )}
      </div>
    </main>
  );
}
