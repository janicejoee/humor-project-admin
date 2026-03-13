import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HumorMixForm } from "./humor-mix-form";

const PAGE_SIZE = 50;

export default async function AdminHumorMixPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: mixRows, error, count } = await supabase
    .from("humor_flavor_mix")
    .select(
      "id, humor_flavor_id, caption_count, humor_flavors(slug, description)",
      { count: "exact" }
    )
    .order("humor_flavor_id", { ascending: true })
    .range(from, to);

  const mixWithFlavor = (mixRows ?? []).map((m) => ({
    ...m,
    humor_flavors: Array.isArray(m.humor_flavors) ? m.humor_flavors[0] : m.humor_flavors,
  }));

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load humor mix: {error.message}
      </div>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Humor Mix
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Configure caption counts per humor flavor. Read and update only.
      </p>

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
                Caption count
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {mixWithFlavor.map((m) => (
              <tr
                key={m.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {m.id}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {m.humor_flavors?.slug ?? m.humor_flavor_id}
                </td>
                <td className="px-4 py-3">
                  <HumorMixForm
                    id={m.id}
                    captionCount={m.caption_count}
                    humorFlavorId={m.humor_flavor_id}
                  />
                </td>
                <td className="px-4 py-3">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mixWithFlavor.length === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No humor mix entries found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/humor-mix?page=${page - 1}`}
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
              href={`/admin/humor-mix?page=${page + 1}`}
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
