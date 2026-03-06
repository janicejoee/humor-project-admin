"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteImageAction } from "./actions";

type ImageRow = {
  id: string;
  url: string | null;
  profile_id: string | null;
  is_common_use: boolean | null;
  is_public: boolean | null;
  created_datetime_utc: string;
  profiles: { email: string | null; first_name: string | null; last_name: string | null } | null;
};

function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(u) || u.includes("imgur") || u.includes("cloudinary");
}

export function ImagesTable({ images }: { images: ImageRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    const err = await deleteImageAction(id);
    if (err) {
      alert(err);
      return;
    }
    router.refresh();
  }

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500">No images found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-16" />
          <col className="min-w-[200px]" />
          <col className="w-40" />
          <col className="w-28" />
          <col className="w-36" />
          <col className="w-28" />
        </colgroup>
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Preview
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              URL
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Owner
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Flags
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {images.map((img) => (
            <tr
              key={img.id}
              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-3 py-2.5">
                {img.url && isImageUrl(img.url) ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/admin/images/${img.id}/edit`}
                  className="block truncate text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  title={img.url ?? img.id}
                >
                  {img.url ?? img.id}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                {img.profiles
                  ? ([img.profiles.first_name, img.profiles.last_name]
                      .filter(Boolean)
                      .join(" ") || img.profiles.email) ?? "—"
                  : img.profile_id ? `${String(img.profile_id).slice(0, 8)}…` : "—"}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {img.is_common_use && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Common
                    </span>
                  )}
                  {img.is_public && (
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                      Public
                    </span>
                  )}
                  {!img.is_common_use && !img.is_public && (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(img.created_datetime_utc).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="inline-flex gap-2">
                  <Link
                    href={`/admin/images/${img.id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
