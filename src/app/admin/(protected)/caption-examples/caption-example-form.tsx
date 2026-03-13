"use client";

import { useActionState } from "react";

type ExampleRow = {
  image_description?: string;
  caption?: string;
  explanation?: string;
  priority?: number;
  image_id?: string | null;
};

export function CaptionExampleForm({
  action,
  images,
  cancelHref,
  initial,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  images: { id: string; url: string | null }[];
  cancelHref: string;
  initial?: ExampleRow | null;
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
        <label htmlFor="image_description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image description
        </label>
        <textarea
          id="image_description"
          name="image_description"
          rows={3}
          required
          defaultValue={initial?.image_description ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Caption
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={2}
          required
          defaultValue={initial?.caption ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="explanation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Explanation
        </label>
        <textarea
          id="explanation"
          name="explanation"
          rows={2}
          required
          defaultValue={initial?.explanation ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Priority
        </label>
        <input
          id="priority"
          name="priority"
          type="number"
          defaultValue={initial?.priority ?? 0}
          className="mt-1 w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="image_id" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image (optional)
        </label>
        <select
          id="image_id"
          name="image_id"
          defaultValue={initial?.image_id ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">— None —</option>
          {images.map((img) => (
            <option key={img.id} value={img.id}>
              {img.url ? `${img.id.slice(0, 8)}… (${img.url.slice(0, 30)}…)` : img.id}
            </option>
          ))}
        </select>
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
