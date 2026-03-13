import Link from "next/link";
import { createAllowedSignupDomainAction } from "../actions";
import { AllowedSignupDomainForm } from "../allowed-signup-domain-form";

export default function NewAllowedSignupDomainPage() {
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
        Add allowed signup domain
      </h1>
      <AllowedSignupDomainForm
        action={createAllowedSignupDomainAction}
        cancelHref="/admin/allowed-signup-domains"
      />
    </div>
  );
}
