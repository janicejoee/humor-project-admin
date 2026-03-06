import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ImagesTable } from "./images-table";

const PAGE_SIZE = 20;

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    profile_id?: string;
    is_common_use?: string;
    is_public?: string;
  }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("images")
    .select(
      "id, url, profile_id, is_common_use, is_public, created_datetime_utc, profiles(email, first_name, last_name)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (params.profile_id) query = query.eq("profile_id", params.profile_id);
  if (params.is_common_use === "true") query = query.eq("is_common_use", true);
  if (params.is_public === "true") query = query.eq("is_public", true);

  const { data: rawImages, error, count } = await query;

  const images = (rawImages ?? []).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles ?? null,
  }));

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load images: {error.message}
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Images
          </h1>
          {params.profile_id && (
            <Link
              href="/admin/images"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← Clear filter
            </Link>
          )}
        </div>
        <Link
          href="/admin/images/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add image
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/images${buildQuery({ is_common_use: undefined, is_public: undefined, page: undefined })}`}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !params.is_common_use && !params.is_public
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </Link>
        <Link
          href={`/admin/images${buildQuery({ is_common_use: "true", page: "1" })}`}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            params.is_common_use === "true"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Common use
        </Link>
        <Link
          href={`/admin/images${buildQuery({ is_public: "true", page: "1" })}`}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            params.is_public === "true"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Public
        </Link>
      </div>

      <ImagesTable images={images} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/images${buildQuery({ page: String(page - 1) })}`}
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
              href={`/admin/images${buildQuery({ page: String(page + 1) })}`}
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
