import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminUsersPage() {
  const supabase = await getCachedClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        Failed to load profiles: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Users
      </h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Superadmin</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="text-sm">
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.email ?? "—"}</td>
                <td className="px-4 py-3">{p.is_superadmin ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {p.created_datetime_utc ? new Date(p.created_datetime_utc).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/images?profile_id=${p.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    Images
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(profiles?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-zinc-500">No profiles found.</p>
        )}
      </div>
    </div>
  );
}
