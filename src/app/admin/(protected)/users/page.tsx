import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const { q, page: pageParam } = params;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `email.ilike.${term},first_name.ilike.${term},last_name.ilike.${term}`
    );
  }

  const { data: profiles, error, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load profiles: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Users
        </h1>
        <form method="get" className="flex gap-2">
          <input type="hidden" name="page" value="1" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email..."
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Superadmin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                In study
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Matrix admin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {(profiles ?? []).map((p) => (
              <tr
                key={p.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.email ?? "—"}
                </td>
                <td className="px-4 py-3">{p.is_superadmin ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{p.is_in_study ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{p.is_matrix_admin ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {p.created_datetime_utc
                    ? new Date(p.created_datetime_utc).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/images?profile_id=${p.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View images
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(profiles?.length ?? 0) === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No profiles found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={q ? `/admin/users?page=${page - 1}&q=${encodeURIComponent(q)}` : `/admin/users?page=${page - 1}`}
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
              href={q ? `/admin/users?page=${page + 1}&q=${encodeURIComponent(q)}` : `/admin/users?page=${page + 1}`}
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
