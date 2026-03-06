import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createImageAction } from "../actions";
import { ImageForm } from "../image-form";

export default async function NewImagePage() {
  const supabase = await getCachedClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .order("email");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/images"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          ← Images
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Add image
      </h1>
      <ImageForm
        action={createImageAction}
        profiles={profiles ?? []}
        cancelHref="/admin/images"
      />
    </div>
  );
}
