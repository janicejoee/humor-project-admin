"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHumorMixAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const caption_count = parseInt(
    (formData.get("caption_count") as string) ?? "0",
    10
  );
  if (isNaN(caption_count) || caption_count < 0 || caption_count > 100) {
    return { error: "Caption count must be 0–100" };
  }

  const supabase = await getCachedClient();
  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({ caption_count })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/humor-mix");
  return {};
}
