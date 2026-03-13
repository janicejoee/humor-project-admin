"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteWhitelistEmailAction } from "./actions";

type EmailRow = {
  id: number;
  email_address: string;
  created_datetime_utc: string;
};

export function WhitelistEmailsTable({ emails }: { emails: EmailRow[] }) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this whitelisted email? This cannot be undone."))
      return;
    const err = await deleteWhitelistEmailAction(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No whitelisted emails found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email
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
          {emails.map((e) => (
            <tr
              key={e.id}
              className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {e.email_address}
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {new Date(e.created_datetime_utc).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex gap-2">
                  <Link
                    href={`/admin/whitelist-emails/${e.id}/edit`}
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
