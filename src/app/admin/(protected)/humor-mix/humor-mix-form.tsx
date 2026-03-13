"use client";

import { useActionState } from "react";
import { updateHumorMixAction } from "./actions";

export function HumorMixForm({
  id,
  captionCount,
  humorFlavorId,
}: {
  id: number;
  captionCount: number;
  humorFlavorId: number;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => {
      const result = await updateHumorMixAction(id, fd);
      if (result?.error) return result.error;
      return null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="humor_flavor_id" value={humorFlavorId} />
      <input
        type="number"
        name="caption_count"
        defaultValue={captionCount}
        min={0}
        max={100}
        className="w-20 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-50"
      >
        {isPending ? "…" : "Save"}
      </button>
      {state && (
        <span className="text-xs text-red-600 dark:text-red-400">{state}</span>
      )}
    </form>
  );
}
