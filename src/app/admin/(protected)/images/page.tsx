import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ImagesTable } from "./images-table";

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ profile_id?: string }>;
}) {
  const supabase = await getCachedClient();
  const params = await searchParams;

  let query = supabase
    .from("images")
    .select("id, url, profile_id, is_common_use, is_public, created_datetime_utc, profiles(email, first_name, last_name)")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (params.profile_id) {
    query = query.eq("profile_id", params.profile_id);
  }

  const { data: images, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load images: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Images</h1>
        <Link
          href="/admin/images/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
        >
          Add image
        </Link>
      </div>
      <ImagesTable images={images ?? []} />
    </div>
  );
}
