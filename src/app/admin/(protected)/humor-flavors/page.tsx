import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HumorFlavorsTable } from "./flavors-table";

const PAGE_SIZE = 25;

export default async function AdminHumorFlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const queryText = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (queryText) {
    const term = `%${queryText}%`;
    query = query.or(`slug.ilike.${term},description.ilike.${term}`);
  }

  const { data: flavors, error, count } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load humor flavors: {error.message}
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
          Humor Flavors
        </h1>
        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="page" value="1" />
          <input
            type="search"
            name="q"
            defaultValue={queryText}
            placeholder="Search flavor name or description..."
            className="w-64 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
          </button>
          {queryText && (
            <Link
              href="/admin/humor-flavors"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <HumorFlavorsTable flavors={flavors ?? []} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/humor-flavors${buildQuery({ page: String(page - 1) })}`}
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
              href={`/admin/humor-flavors${buildQuery({ page: String(page + 1) })}`}
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
