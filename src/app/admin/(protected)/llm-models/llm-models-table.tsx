"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteLlmModelAction } from "./actions";

type ModelRow = {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_providers: { name: string } | null;
};

export function LlmModelsTable({ models }: { models: ModelRow[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this LLM model? This cannot be undone.")) return;
    const err = await deleteLlmModelAction(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No LLM models found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Provider
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Provider model ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Temp supported
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {models.map((m) => (
            <tr
              key={m.id}
              className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {m.id}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {m.name}
              </td>
              <td className="px-4 py-3">
                {m.llm_providers?.name ?? m.llm_provider_id}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {m.provider_model_id}
              </td>
              <td className="px-4 py-3">{m.is_temperature_supported ? "Yes" : "No"}</td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex gap-2">
                  <Link
                    href={`/admin/llm-models/${m.id}/edit`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
