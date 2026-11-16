import Link from "next/link";
import type { CurrentUser } from "@/lib/auth";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-sm text-white">D</span>
          Docs
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600" title={user.email}>
            Signed in as <span className="font-medium text-gray-900">{user.name}</span>
          </span>
          <Link href="/login" className="text-blue-600 hover:underline">
            Switch user
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50">Log out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
