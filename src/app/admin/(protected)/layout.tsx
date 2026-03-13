import { getCachedClient, getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await getCachedClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_superadmin) {
    redirect("/auth/logout?redirect=" + encodeURIComponent("/admin/forbidden"));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <AdminSidebar user={user} />
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
