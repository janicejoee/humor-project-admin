"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTermAction } from "./actions";

type TermRow = {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  created_datetime_utc: string;
};

export function TermsTable({ terms }: { terms: TermRow[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this term? This cannot be undone.")) return;
    const err = await deleteTermAction(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (terms.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No terms found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Term
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Definition
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {terms.map((t) => (
            <tr
              key={t.id}
              className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {t.term}
              </td>
              <td className="max-w-md px-4 py-3 text-zinc-600 dark:text-zinc-400">
                <span className="line-clamp-2">{t.definition}</span>
              </td>
              <td className="px-4 py-3">{t.priority}</td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {new Date(t.created_datetime_utc).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex gap-2">
                  <Link
                    href={`/admin/terms/${t.id}/edit`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
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
