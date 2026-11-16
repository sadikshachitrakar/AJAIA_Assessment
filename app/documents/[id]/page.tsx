import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findDocumentForUser } from "@/lib/documents";
import { can } from "@/lib/permissions";
import { DocumentEditor } from "@/components/DocumentEditor";

export default async function DocumentPage({ params }: PageProps<"/documents/[id]">) {
  const user = await requireUser();
  const found = await findDocumentForUser((await params).id, user.id);
  if (!found) notFound(); // missing or no access — indistinguishable on purpose

  const { id, title, content, owner } = found.document;
  return (
    <DocumentEditor
      document={{ id, title, content, owner: { name: owner.name } }}
      role={found.role}
      // Only the owner manages sharing, so only the owner receives the collaborator list.
      collaborators={can(found.role, "share") ? found.collaborators : []}
    />
  );
}
