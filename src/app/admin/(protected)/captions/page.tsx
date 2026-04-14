import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 25;

export default async function AdminCaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; caption_request_id?: string; min_likes?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("captions")
    .select("id, content, image_id, profile_id, is_featured, like_count, caption_request_id, created_datetime_utc", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (params.caption_request_id) {
    query = query.eq("caption_request_id", parseInt(params.caption_request_id, 10));
  }
  if (params.min_likes) {
    query = query.gte("like_count", parseInt(params.min_likes, 10) || 0);
  }

  const { data: captions, error, count } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load captions: {error.message}
      </div>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildQuery(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    Object.entries({ ...params, ...overrides }).forEach(([k, v]) => {
      if (v != null && v !== "") sp.set(k, v);
    });
    const s = sp.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Captions
        </h1>
        <div className="flex items-center gap-3">
          {(params.caption_request_id || params.min_likes) && (
            <Link
              href="/admin/captions"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Clear filter
            </Link>
          )}
          <form method="get" className="flex items-center gap-2">
            {params.caption_request_id && (
              <input
                type="hidden"
                name="caption_request_id"
                value={params.caption_request_id}
              />
            )}
            <input type="hidden" name="page" value="1" />
            <input
              type="number"
              name="min_likes"
              min="0"
              step="1"
              defaultValue={params.min_likes ?? ""}
              placeholder="Min likes"
              className="w-28 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Content
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Featured
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Likes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {(captions ?? []).map((c) => (
              <tr
                key={c.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="max-w-md px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  <span className="line-clamp-2">{c.content ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/images/${c.image_id}/edit`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {c.image_id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3">{c.is_featured ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {c.like_count}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {c.created_datetime_utc
                    ? new Date(c.created_datetime_utc).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(captions?.length ?? 0) === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No captions found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/captions${buildQuery({ page: String(page - 1) })}`}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Previous
            </Link>
          )}
          <span className="px-3 text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/captions${buildQuery({ page: String(page + 1) })}`}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
