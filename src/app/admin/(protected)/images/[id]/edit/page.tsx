import { getCachedClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateImageAction } from "../../actions";
import { ImageForm } from "../../image-form";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getCachedClient();

  const { data: image, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !image) notFound();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .order("email");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/images"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to images
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit image
      </h1>
      <ImageForm
        action={updateImageAction.bind(null, id)}
        profiles={profiles ?? []}
        cancelHref="/admin/images"
        initial={image}
      />
    </div>
  );
}
