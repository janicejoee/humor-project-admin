import Link from "next/link";
import { createTermAction } from "../actions";
import { TermForm } from "../term-form";

export default function NewTermPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/terms"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to terms
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Add term
      </h1>
      <TermForm action={createTermAction} cancelHref="/admin/terms" />
    </div>
  );
}
