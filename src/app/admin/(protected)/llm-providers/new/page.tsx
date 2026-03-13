import Link from "next/link";
import { createLlmProviderAction } from "../actions";
import { LlmProviderForm } from "../llm-provider-form";

export default function NewLlmProviderPage() {
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
        Add LLM provider
      </h1>
      <LlmProviderForm action={createLlmProviderAction} cancelHref="/admin/llm-providers" />
    </div>
  );
}
