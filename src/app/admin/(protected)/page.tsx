import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await getCachedClient();

  const [
    { count: profilesCount },
    { count: imagesCount },
    { count: captionsCount },
    { data: recentProfiles },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("images").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, email, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Users
          </p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {profilesCount ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/images"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Images
          </p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {imagesCount ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/captions"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Captions
          </p>
          <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            {captionsCount ?? 0}
          </p>
        </Link>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Recent sign-ups
        </h2>
        <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {(recentProfiles ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <span className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                {p.email ?? p.id}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {p.created_datetime_utc
                  ? new Date(p.created_datetime_utc).toLocaleDateString()
                  : "—"}
              </span>
            </li>
          ))}
          {(recentProfiles?.length ?? 0) === 0 && (
            <li className="py-6 text-center text-sm text-zinc-500">
              No profiles yet
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
