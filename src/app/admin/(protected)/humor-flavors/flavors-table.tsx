"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";

type FlavorRow = {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
};

type StepRow = {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  description: string | null;
  llm_temperature: number | null;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  humor_flavor_step_type_id: number;
};

const COL_COUNT = 5;

export function HumorFlavorsTable({ flavors }: { flavors: FlavorRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [steps, setSteps] = useState<StepRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<number | null>(null);

  async function toggle(flavor: FlavorRow) {
    if (expandedId === flavor.id) {
      setExpandedId(null);
      setSteps(null);
      setError(null);
      return;
    }

    setExpandedId(flavor.id);
    setSteps(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/humor-flavor-steps?humor_flavor_id=${flavor.id}`
      );
      const json = (await res.json()) as { steps?: StepRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load steps");
      setSteps(json.steps ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load steps");
    } finally {
      setLoading(false);
    }
  }

  async function duplicateFlavor(flavor: FlavorRow) {
    const proposed = window.prompt(
      "Enter a unique name for the duplicated flavor:",
      `${flavor.slug}-copy`
    );

    if (proposed === null) return;

    const newSlug = proposed.trim();
    if (!newSlug) {
      setDuplicateError("Please provide a non-empty unique flavor name.");
      return;
    }

    setDuplicateError(null);
    setDuplicateLoadingId(flavor.id);

    try {
      const res = await fetch("/api/admin/humor-flavors/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          humor_flavor_id: flavor.id,
          new_slug: newSlug,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to duplicate flavor");
      router.refresh();
    } catch (e) {
      setDuplicateError(
        e instanceof Error ? e.message : "Failed to duplicate flavor"
      );
    } finally {
      setDuplicateLoadingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {duplicateError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {duplicateError}
        </div>
      )}
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Slug
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {flavors.map((f) => {
            const isOpen = expandedId === f.id;
            return (
              <Fragment key={f.id}>
                <tr className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {f.id}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {f.slug}
                  </td>
                  <td className="max-w-md px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    <span className="line-clamp-2">{f.description ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {f.created_datetime_utc
                      ? new Date(f.created_datetime_utc).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggle(f)}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {isOpen ? "Hide steps" : "View steps"}
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateFlavor(f)}
                        disabled={duplicateLoadingId === f.id}
                        className="font-medium text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-400"
                      >
                        {duplicateLoadingId === f.id ? "Duplicating..." : "Duplicate"}
                      </button>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={COL_COUNT} className="bg-zinc-50/60 px-4 py-3 dark:bg-zinc-800/30">
                      {loading && (
                        <p className="text-sm text-zinc-500">Loading steps…</p>
                      )}
                      {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                          {error}
                        </div>
                      )}
                      {!loading && !error && steps && (
                        steps.length === 0 ? (
                          <p className="text-sm text-zinc-500">No steps found.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
                              <thead className="bg-zinc-100 dark:bg-zinc-800/60">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Order
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Description
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Temp
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Model
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    IO
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Type
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {steps.map((s) => (
                                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                                      {s.order_by}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                      {s.description ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                      {s.llm_temperature ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                      {s.llm_model_id}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                      {s.llm_input_type_id} → {s.llm_output_type_id}
                                    </td>
                                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                                      {s.humor_flavor_step_type_id}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {flavors.length === 0 && (
        <p className="px-4 py-12 text-center text-zinc-500">
          No humor flavors found.
        </p>
      )}
    </div>
  );
}
