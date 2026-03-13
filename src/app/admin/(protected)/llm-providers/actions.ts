"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteLlmProviderAction(id: number): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/llm-providers");
  return null;
}

export async function createLlmProviderAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  const { data: maxRow } = await supabase
    .from("llm_providers")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();
  const nextId = (maxRow?.id ?? 0) + 1;

  const { error } = await supabase.from("llm_providers").insert({ id: nextId, name });

  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  redirect("/admin/llm-providers");
}

export async function updateLlmProviderAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  const { error } = await supabase
    .from("llm_providers")
    .update({ name })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/llm-providers");
  revalidatePath(`/admin/llm-providers/${id}/edit`);
  redirect("/admin/llm-providers");
}
