import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 25;

export default async function AdminHumorFlavorStepsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; humor_flavor_id?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("humor_flavor_steps")
    .select(
      "id, humor_flavor_id, order_by, description, llm_temperature, llm_model_id, humor_flavors(slug)",
      { count: "exact" }
    )
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true })
    .range(from, to);

  if (params.humor_flavor_id) {
    query = query.eq("humor_flavor_id", params.humor_flavor_id);
  }

  const { data: steps, error, count } = await query;

  const stepsWithFlavor = (steps ?? []).map((s) => ({
    ...s,
    humor_flavors: Array.isArray(s.humor_flavors) ? s.humor_flavors[0] : s.humor_flavors,
  }));

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load humor flavor steps: {error.message}
      </div>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Humor Flavor Steps
        </h1>
        {params.humor_flavor_id && (
          <Link
            href="/admin/humor-flavor-steps"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Clear filter
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Flavor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Temperature
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                LLM Model ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {stepsWithFlavor.map((s) => (
              <tr
                key={s.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {s.id}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {s.humor_flavor_id}
                  {s.humor_flavors?.slug && (
                    <span className="ml-1 text-zinc-400">
                      ({s.humor_flavors.slug})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{s.order_by}</td>
                <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  <span className="line-clamp-2">{s.description ?? "—"}</span>
                </td>
                <td className="px-4 py-3">{s.llm_temperature ?? "—"}</td>
                <td className="px-4 py-3">{s.llm_model_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stepsWithFlavor.length === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No humor flavor steps found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/humor-flavor-steps?page=${page - 1}${params.humor_flavor_id ? `&humor_flavor_id=${params.humor_flavor_id}` : ""}`}
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
              href={`/admin/humor-flavor-steps?page=${page + 1}${params.humor_flavor_id ? `&humor_flavor_id=${params.humor_flavor_id}` : ""}`}
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
