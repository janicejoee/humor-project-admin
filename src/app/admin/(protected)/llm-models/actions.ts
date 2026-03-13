"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteLlmModelAction(id: number): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/llm-models");
  return null;
}

export async function createLlmModelAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const name = (formData.get("name") as string)?.trim();
  const llm_provider_id = parseInt((formData.get("llm_provider_id") as string) ?? "0", 10);
  const provider_model_id = (formData.get("provider_model_id") as string)?.trim();
  const is_temperature_supported = formData.get("is_temperature_supported") === "on";

  if (!name || !provider_model_id || isNaN(llm_provider_id) || llm_provider_id < 1) {
    return { error: "Name, provider, and provider model ID are required" };
  }

  const { data: maxRow } = await supabase
    .from("llm_models")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();
  const nextId = (maxRow?.id ?? 0) + 1;

  const { error } = await supabase.from("llm_models").insert({
    id: nextId,
    name,
    llm_provider_id,
    provider_model_id,
    is_temperature_supported,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  redirect("/admin/llm-models");
}

export async function updateLlmModelAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const name = (formData.get("name") as string)?.trim();
  const llm_provider_id = parseInt((formData.get("llm_provider_id") as string) ?? "0", 10);
  const provider_model_id = (formData.get("provider_model_id") as string)?.trim();
  const is_temperature_supported = formData.get("is_temperature_supported") === "on";

  if (!name || !provider_model_id || isNaN(llm_provider_id) || llm_provider_id < 1) {
    return { error: "Name, provider, and provider model ID are required" };
  }

  const { error } = await supabase
    .from("llm_models")
    .update({
      name,
      llm_provider_id,
      provider_model_id,
      is_temperature_supported,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/llm-models");
  revalidatePath(`/admin/llm-models/${id}/edit`);
  redirect("/admin/llm-models");
}
