import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateWhitelistEmailAction } from "../../actions";
import { WhitelistEmailForm } from "../../whitelist-email-form";

export default async function EditWhitelistEmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: email, error } = await supabase
    .from("whitelist_email_addresses")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (error || !email) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/whitelist-emails"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to whitelisted emails
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit whitelisted email
      </h1>
      <WhitelistEmailForm
        action={(fd) => updateWhitelistEmailAction(email.id, fd)}
        cancelHref="/admin/whitelist-emails"
        initial={email}
      />
    </div>
  );
}
