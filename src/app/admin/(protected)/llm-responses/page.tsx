import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

const PAGE_SIZE = 25;

export default async function AdminLlmResponsesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; llm_prompt_chain_id?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("llm_model_responses")
    .select(
      "id, llm_model_response, processing_time_seconds, llm_model_id, caption_request_id, humor_flavor_id, llm_prompt_chain_id, created_datetime_utc, llm_models!llm_model_id(name)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (params.llm_prompt_chain_id) {
    query = query.eq(
      "llm_prompt_chain_id",
      parseInt(params.llm_prompt_chain_id, 10)
    );
  }

  const { data: responses, error, count } = await query;

  const responsesWithModel = (responses ?? []).map((r) => ({
    ...r,
    llm_models: Array.isArray(r.llm_models) ? r.llm_models[0] : r.llm_models,
  }));

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load LLM responses: {error.message}
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
          LLM Responses
        </h1>
        {params.llm_prompt_chain_id && (
          <Link
            href="/admin/llm-responses"
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
                Model
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Response
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Time (s)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Caption req
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {responsesWithModel.map((r) => (
              <tr
                key={r.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {r.llm_models?.name ?? r.llm_model_id}
                </td>
                <td className="max-w-md px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  <span className="line-clamp-2">
                    {r.llm_model_response ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">{r.processing_time_seconds}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/caption-requests?id=${r.caption_request_id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {r.caption_request_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {r.created_datetime_utc
                    ? new Date(r.created_datetime_utc).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {responsesWithModel.length === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No LLM responses found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/llm-responses${buildQuery({ page: String(page - 1) })}`}
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
              href={`/admin/llm-responses${buildQuery({ page: String(page + 1) })}`}
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
