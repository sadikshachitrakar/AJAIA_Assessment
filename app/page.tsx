import { requireUser } from "@/lib/auth";

// Placeholder dashboard — replaced in step 2.
export default async function Home() {
  const user = await requireUser();
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Docs</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">{user.name} ({user.email})</span>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-md border px-3 py-1.5 hover:bg-gray-50">Log out</button>
          </form>
        </div>
      </header>
      <p className="mt-8 text-gray-500">Signed in. Documents coming in step 2.</p>
    </main>
  );
}
