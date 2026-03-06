import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminCaptionsPage() {
  const supabase = await getCachedClient();
  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content, image_id, profile_id, is_featured, like_count, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load captions: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Captions</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Content</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Featured</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Likes</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {(captions ?? []).map((c) => (
              <tr key={c.id} className="text-sm">
                <td className="max-w-xs px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  <span className="line-clamp-2">{c.content ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/images/${c.image_id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {c.image_id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3">{c.is_featured ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.like_count}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {c.created_datetime_utc ? new Date(c.created_datetime_utc).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(captions?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No captions found.</p>
        )}
      </div>
    </div>
  );
}
