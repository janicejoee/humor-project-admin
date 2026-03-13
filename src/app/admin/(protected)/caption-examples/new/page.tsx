import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createCaptionExampleAction } from "../actions";
import { CaptionExampleForm } from "../caption-example-form";

export default async function NewCaptionExamplePage() {
  const supabase = await getCachedClient();
  const { data: images } = await supabase
    .from("images")
    .select("id, url")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/caption-examples"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to caption examples
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Add caption example
      </h1>
      <CaptionExampleForm
        action={createCaptionExampleAction}
        images={images ?? []}
        cancelHref="/admin/caption-examples"
      />
    </div>
  );
}
