"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCaptionExampleAction } from "./actions";

type ExampleRow = {
  id: number;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
  created_datetime_utc: string;
};

export function CaptionExamplesTable({ examples }: { examples: ExampleRow[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this caption example? This cannot be undone.")) return;
    const err = await deleteCaptionExampleAction(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (examples.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No caption examples found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Image description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Caption
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
          {examples.map((e) => (
            <tr
              key={e.id}
              className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-400">
                <span className="line-clamp-2">{e.image_description}</span>
              </td>
              <td className="max-w-xs px-4 py-3 text-zinc-900 dark:text-zinc-100">
                <span className="line-clamp-2">{e.caption}</span>
              </td>
              <td className="px-4 py-3">{e.priority}</td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {new Date(e.created_datetime_utc).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex gap-2">
                  <Link
                    href={`/admin/caption-examples/${e.id}/edit`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
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
