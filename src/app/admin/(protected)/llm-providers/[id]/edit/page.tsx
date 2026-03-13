import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLlmProviderAction } from "../../actions";
import { LlmProviderForm } from "../../llm-provider-form";

export default async function EditLlmProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: provider, error } = await supabase
    .from("llm_providers")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (error || !provider) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/llm-providers"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to LLM providers
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit LLM provider
      </h1>
      <LlmProviderForm
        action={(fd) => updateLlmProviderAction(provider.id, fd)}
        cancelHref="/admin/llm-providers"
        initial={provider}
      />
    </div>
  );
}
