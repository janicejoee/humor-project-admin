"use client";

import { useActionState } from "react";

export function LlmProviderForm({
  action,
  cancelHref,
  initial,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  cancelHref: string;
  initial?: { name?: string } | null;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => {
      const result = await action(fd);
      if (result && typeof result === "object" && result.error) return result.error;
      return null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {state}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initial?.name ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <a
          href={cancelHref}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
