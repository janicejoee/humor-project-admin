import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { TermsTable } from "./terms-table";

const PAGE_SIZE = 20;

export default async function AdminTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("terms")
    .select("id, term, definition, example, priority, term_type_id, created_datetime_utc", {
      count: "exact",
    })
    .order("priority", { ascending: false })
    .order("term", { ascending: true })
    .range(from, to);

  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    query = query.or(`term.ilike.${term},definition.ilike.${term}`);
  }

  const { data: terms, error, count } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load terms: {error.message}
      </div>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Terms
        </h1>
        <div className="flex gap-2">
          <form method="get" className="flex gap-2">
            <input type="hidden" name="page" value="1" />
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder="Search terms..."
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Search
            </button>
          </form>
          <Link
            href="/admin/terms/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add term
          </Link>
        </div>
      </div>

      <TermsTable terms={terms ?? []} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={
                params.q
                  ? `/admin/terms?page=${page - 1}&q=${encodeURIComponent(params.q)}`
                  : `/admin/terms?page=${page - 1}`
              }
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
              href={
                params.q
                  ? `/admin/terms?page=${page + 1}&q=${encodeURIComponent(params.q)}`
                  : `/admin/terms?page=${page + 1}`
              }
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
