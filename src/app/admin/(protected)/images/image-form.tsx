"use client";

import { useActionState } from "react";

type ImageRow = {
  url?: string | null;
  is_common_use?: boolean | null;
  is_public?: boolean | null;
  additional_context?: string | null;
  image_description?: string | null;
  celebrity_recognition?: string | null;
};

export function ImageForm({
  action,
  cancelHref,
  initial,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  cancelHref: string;
  initial?: ImageRow | null;
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
    <form action={formAction} className="max-w-xl space-y-4" encType="multipart/form-data">
      {state && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {state}
        </p>
      )}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Upload image (or use URL below)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/*"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          URL (if not uploading)
        </label>
        <input
          id="url"
          name="url"
          type="url"
          defaultValue={initial?.url ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={initial?.is_common_use ?? false}
            className="rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Common use</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={initial?.is_public ?? false}
            className="rounded border-zinc-300"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Public</span>
        </label>
      </div>
      <div>
        <label htmlFor="additional_context" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Additional context
        </label>
        <input
          id="additional_context"
          name="additional_context"
          type="text"
          defaultValue={initial?.additional_context ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="image_description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image description
        </label>
        <textarea
          id="image_description"
          name="image_description"
          rows={3}
          defaultValue={initial?.image_description ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="celebrity_recognition" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Celebrity recognition
        </label>
        <input
          id="celebrity_recognition"
          name="celebrity_recognition"
          type="text"
          defaultValue={initial?.celebrity_recognition ?? ""}
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
