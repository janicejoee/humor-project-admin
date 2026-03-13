"use client";

import { useMemo, useState } from "react";

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

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[min(900px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function HumorFlavorsTable({ flavors }: { flavors: FlavorRow[] }) {
  const [openFlavor, setOpenFlavor] = useState<FlavorRow | null>(null);
  const [steps, setSteps] = useState<StepRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!openFlavor) return "Humor steps";
    return `Humor steps — ${openFlavor.slug} (#${openFlavor.id})`;
  }, [openFlavor]);

  async function openSteps(flavor: FlavorRow) {
    setOpenFlavor(flavor);
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

  function close() {
    setOpenFlavor(null);
    setSteps(null);
    setError(null);
    setLoading(false);
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
            {flavors.map((f) => (
              <tr
                key={f.id}
                className="text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
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
                  <button
                    type="button"
                    onClick={() => openSteps(f)}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View steps
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {flavors.length === 0 && (
          <p className="px-4 py-12 text-center text-zinc-500">
            No humor flavors found.
          </p>
        )}
      </div>

      <Modal open={!!openFlavor} title={title} onClose={close}>
        {loading && (
          <p className="text-sm text-zinc-500">Loading steps…</p>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}
        {!loading && !error && steps && (
          <div className="space-y-3">
            {steps.length === 0 ? (
              <p className="text-sm text-zinc-500">No steps found.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/40">
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
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

