import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listDocumentsForUser, type DocumentSummary } from "@/lib/documents";
import { AppHeader } from "@/components/AppHeader";
import { NewDocumentButton } from "@/components/NewDocumentButton";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default async function Dashboard() {
  const user = await requireUser();
  const { owned, shared } = await listDocumentsForUser(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <NewDocumentButton />
        </div>

        <DocumentSection title="My documents" docs={owned} empty="No documents yet. Create one to get started." />
        <DocumentSection title="Shared with me" docs={shared} empty="Nothing has been shared with you yet." shared />
      </main>
    </div>
  );
}

function DocumentSection({
  title,
  docs,
  empty,
  shared = false,
}: {
  title: string;
  docs: DocumentSummary[];
  empty: string;
  shared?: boolean;
}) {
  return (
    <section aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
        {title} <span className="text-gray-400">({docs.length})</span>
      </h2>
      {docs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {docs.map((d) => (
            <li key={d.id}>
              <Link href={`/documents/${d.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50">
                <span aria-hidden className="text-blue-600">▤</span>
                <span className="min-w-0 flex-1 truncate font-medium text-gray-900">{d.title}</span>
                {shared ? (
                  <>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Shared</span>
                    <span className="shrink-0 text-xs text-gray-500">Owned by {d.owner.name}</span>
                  </>
                ) : (
                  d.collaboratorCount > 0 && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {d.collaboratorCount} {d.collaboratorCount === 1 ? "collaborator" : "collaborators"}
                    </span>
                  )
                )}
                <time dateTime={d.updatedAt.toISOString()} className="shrink-0 text-xs text-gray-500">
                  {dateFormat.format(d.updatedAt)} UTC
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
