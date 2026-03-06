"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteImageAction(id: string): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/images");
  return null;
}

export async function createImageAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const url = formData.get("url") as string | null;
  const profile_id = (formData.get("profile_id") as string) || null;
  const is_common_use = formData.get("is_common_use") === "on";
  const is_public = formData.get("is_public") === "on";
  const additional_context = (formData.get("additional_context") as string) || null;
  const image_description = (formData.get("image_description") as string) || null;
  const celebrity_recognition = (formData.get("celebrity_recognition") as string) || null;

  const { error } = await supabase.from("images").insert({
    url: url || null,
    profile_id: profile_id || null,
    is_common_use,
    is_public,
    additional_context,
    image_description,
    celebrity_recognition,
    modified_datetime_utc: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  redirect("/admin/images");
}

export async function updateImageAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const url = formData.get("url") as string | null;
  const profile_id = (formData.get("profile_id") as string) || null;
  const is_common_use = formData.get("is_common_use") === "on";
  const is_public = formData.get("is_public") === "on";
  const additional_context = (formData.get("additional_context") as string) || null;
  const image_description = (formData.get("image_description") as string) || null;
  const celebrity_recognition = (formData.get("celebrity_recognition") as string) || null;

  const { error } = await supabase
    .from("images")
    .update({
      url: url || null,
      profile_id: profile_id || null,
      is_common_use,
      is_public,
      additional_context,
      image_description,
      celebrity_recognition,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/images");
  revalidatePath(`/admin/images/${id}/edit`);
  redirect("/admin/images");
}
