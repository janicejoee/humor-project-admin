"use client";

import { useActionState } from "react";

type Provider = { id: number; name: string };

export function LlmModelForm({
  action,
  providers,
  cancelHref,
  initial,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  providers: Provider[];
  cancelHref: string;
  initial?: {
    name?: string;
    llm_provider_id?: number;
    provider_model_id?: string;
    is_temperature_supported?: boolean;
  } | null;
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
      <div>
        <label htmlFor="llm_provider_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Provider
        </label>
        <select
          id="llm_provider_id"
          name="llm_provider_id"
          required
          defaultValue={initial?.llm_provider_id ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">— Select —</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="provider_model_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Provider model ID
        </label>
        <input
          id="provider_model_id"
          name="provider_model_id"
          type="text"
          required
          defaultValue={initial?.provider_model_id ?? ""}
          placeholder="e.g. gpt-4o"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_temperature_supported"
            defaultChecked={initial?.is_temperature_supported ?? false}
            className="rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Temperature supported
          </span>
        </label>
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
