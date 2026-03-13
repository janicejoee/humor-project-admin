import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCaptionExampleAction } from "../../actions";
import { CaptionExampleForm } from "../../caption-example-form";

export default async function EditCaptionExamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: example, error } = await supabase
    .from("caption_examples")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single();

  if (error || !example) notFound();

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
        Edit caption example
      </h1>
      <CaptionExampleForm
        action={(fd) => updateCaptionExampleAction(example.id, fd)}
        images={images ?? []}
        cancelHref="/admin/caption-examples"
        initial={example}
      />
    </div>
  );
}
