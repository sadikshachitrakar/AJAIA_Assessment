import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Document not found</h1>
      <p className="text-sm text-gray-500">It may have been deleted, or you don&apos;t have access.</p>
      <Link href="/" className="text-sm text-blue-600 hover:underline">Back to documents</Link>
    </main>
  );
}
