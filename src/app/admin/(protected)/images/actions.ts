"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Ensure an "images" bucket exists in Supabase Storage (Dashboard → Storage)
const STORAGE_BUCKET = "images";

async function getImageUrl(formData: FormData, existingUrl: string | null): Promise<string | null> {
  const file = formData.get("file") as File | null;
  if (file?.size && file.size > 0) {
    const supabase = await getCachedClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }
  const url = formData.get("url") as string | null;
  return url?.trim() || existingUrl;
}

export async function deleteImageAction(id: string): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/images");
  return null;
}

export async function createImageAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await getCachedClient();
    const url = await getImageUrl(formData, null);
    const profile_id = (formData.get("profile_id") as string) || null;
    const is_common_use = formData.get("is_common_use") === "on";
    const is_public = formData.get("is_public") === "on";
    const additional_context = (formData.get("additional_context") as string) || null;
    const image_description = (formData.get("image_description") as string) || null;
    const celebrity_recognition = (formData.get("celebrity_recognition") as string) || null;

    const { error } = await supabase.from("images").insert({
    url: url,
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
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function updateImageAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const supabase = await getCachedClient();
    const { data: existing } = await supabase.from("images").select("url").eq("id", id).single();
    const url = await getImageUrl(formData, existing?.url ?? null);
    const profile_id = (formData.get("profile_id") as string) || null;
    const is_common_use = formData.get("is_common_use") === "on";
    const is_public = formData.get("is_public") === "on";
    const additional_context = (formData.get("additional_context") as string) || null;
    const image_description = (formData.get("image_description") as string) || null;
    const celebrity_recognition = (formData.get("celebrity_recognition") as string) || null;

    const { error } = await supabase
      .from("images")
      .update({
        url: url,
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
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
