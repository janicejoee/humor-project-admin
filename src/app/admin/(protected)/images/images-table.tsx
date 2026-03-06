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

export function ImagesTable({ images }: { images: ImageRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string, url: string | null) {
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
      <p className="rounded-lg border border-zinc-200 bg-white py-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        No images found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              URL / Preview
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Common / Public
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {images.map((img) => (
            <tr key={img.id} className="text-sm">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/images/${img.id}/edit`}
                  className="max-w-[200px] truncate text-blue-600 dark:text-blue-400 hover:underline block"
                >
                  {img.url ?? img.id}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {img.profiles
                  ? ([img.profiles.first_name, img.profiles.last_name]
                      .filter(Boolean)
                      .join(" ") || img.profiles.email) ?? img.profile_id ?? "—"
                  : img.profile_id ?? "—"}
              </td>
              <td className="px-4 py-3">
                {img.is_common_use ? "Common " : ""}
                {img.is_public ? "Public" : ""}
                {!img.is_common_use && !img.is_public ? "—" : ""}
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {new Date(img.created_datetime_utc).toLocaleString()}
              </td>
              <td className="px-4 py-3 flex gap-2">
                <Link
                  href={`/admin/images/${img.id}/edit`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id, img.url)}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
