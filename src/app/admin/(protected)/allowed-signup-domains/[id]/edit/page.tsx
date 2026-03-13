import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateAllowedSignupDomainAction } from "../../actions";
import { AllowedSignupDomainForm } from "../../allowed-signup-domain-form";

export default async function EditAllowedSignupDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: domain, error } = await supabase
    .from("allowed_signup_domains")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (error || !domain) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/allowed-signup-domains"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to allowed signup domains
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit allowed signup domain
      </h1>
      <AllowedSignupDomainForm
        action={(fd) => updateAllowedSignupDomainAction(domain.id, fd)}
        cancelHref="/admin/allowed-signup-domains"
        initial={domain}
      />
    </div>
  );
}
