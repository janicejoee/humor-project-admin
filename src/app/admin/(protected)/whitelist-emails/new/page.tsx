import Link from "next/link";
import { createWhitelistEmailAction } from "../actions";
import { WhitelistEmailForm } from "../whitelist-email-form";

export default function NewWhitelistEmailPage() {
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
        Add whitelisted email
      </h1>
      <WhitelistEmailForm
        action={createWhitelistEmailAction}
        cancelHref="/admin/whitelist-emails"
      />
    </div>
  );
}
