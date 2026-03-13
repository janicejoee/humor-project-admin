"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteCaptionExampleAction(id: number): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/caption-examples");
  return null;
}

export async function createCaptionExampleAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const image_description = (formData.get("image_description") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim();
  const priority = parseInt((formData.get("priority") as string) ?? "0", 10);
  const image_id = (formData.get("image_id") as string) || null;

  if (!image_description || !caption || !explanation) {
    return { error: "Image description, caption, and explanation are required" };
  }

  const { error } = await supabase.from("caption_examples").insert({
    image_description,
    caption,
    explanation,
    priority: isNaN(priority) ? 0 : priority,
    image_id: image_id || null,
    modified_datetime_utc: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  redirect("/admin/caption-examples");
}

export async function updateCaptionExampleAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const image_description = (formData.get("image_description") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim();
  const priority = parseInt((formData.get("priority") as string) ?? "0", 10);
  const image_id = (formData.get("image_id") as string) || null;

  if (!image_description || !caption || !explanation) {
    return { error: "Image description, caption, and explanation are required" };
  }

  const { error } = await supabase
    .from("caption_examples")
    .update({
      image_description,
      caption,
      explanation,
      priority: isNaN(priority) ? 0 : priority,
      image_id: image_id || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/caption-examples");
  revalidatePath(`/admin/caption-examples/${id}/edit`);
  redirect("/admin/caption-examples");
}
