"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteTermAction(id: number): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/terms");
  return null;
}

export async function createTermAction(formData: FormData): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const term = (formData.get("term") as string)?.trim();
  const definition = (formData.get("definition") as string)?.trim();
  const example = (formData.get("example") as string)?.trim();
  const priority = parseInt((formData.get("priority") as string) ?? "0", 10);
  const term_type_id = (formData.get("term_type_id") as string) || null;

  if (!term || !definition || !example) {
    return { error: "Term, definition, and example are required" };
  }

  const { error } = await supabase.from("terms").insert({
    term,
    definition,
    example,
    priority: isNaN(priority) ? 0 : priority,
    term_type_id: term_type_id ? parseInt(term_type_id, 10) : null,
    modified_datetime_utc: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  redirect("/admin/terms");
}

export async function updateTermAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const term = (formData.get("term") as string)?.trim();
  const definition = (formData.get("definition") as string)?.trim();
  const example = (formData.get("example") as string)?.trim();
  const priority = parseInt((formData.get("priority") as string) ?? "0", 10);
  const term_type_id = (formData.get("term_type_id") as string) || null;

  if (!term || !definition || !example) {
    return { error: "Term, definition, and example are required" };
  }

  const { error } = await supabase
    .from("terms")
    .update({
      term,
      definition,
      example,
      priority: isNaN(priority) ? 0 : priority,
      term_type_id: term_type_id ? parseInt(term_type_id, 10) : null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/terms");
  revalidatePath(`/admin/terms/${id}/edit`);
  redirect("/admin/terms");
}
