import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createLlmModelAction } from "../actions";
import { LlmModelForm } from "../llm-model-form";

export default async function NewLlmModelPage() {
  const supabase = await getCachedClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/llm-models"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to LLM models
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Add LLM model
      </h1>
      <LlmModelForm
        action={createLlmModelAction}
        providers={providers ?? []}
        cancelHref="/admin/llm-models"
      />
    </div>
  );
}
