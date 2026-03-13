import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTermAction } from "../../actions";
import { TermForm } from "../../term-form";

export default async function EditTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: term, error } = await supabase
    .from("terms")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (error || !term) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/terms"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to terms
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit term
      </h1>
      <TermForm
        action={(fd) => updateTermAction(term.id, fd)}
        cancelHref="/admin/terms"
        initial={term}
      />
    </div>
  );
}
