"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteWhitelistEmailAction(id: number): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .delete()
    .eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/whitelist-emails");
  return null;
}

export async function createWhitelistEmailAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const email_address = (formData.get("email_address") as string)?.trim();
  if (!email_address) return { error: "Email address is required" };

  const { error } = await supabase
    .from("whitelist_email_addresses")
    .insert({
      email_address,
      modified_datetime_utc: new Date().toISOString(),
    });

  if (error) return { error: error.message };
  revalidatePath("/admin/whitelist-emails");
  redirect("/admin/whitelist-emails");
}

export async function updateWhitelistEmailAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const email_address = (formData.get("email_address") as string)?.trim();
  if (!email_address) return { error: "Email address is required" };

  const { error } = await supabase
    .from("whitelist_email_addresses")
    .update({
      email_address,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/whitelist-emails");
  revalidatePath(`/admin/whitelist-emails/${id}/edit`);
  redirect("/admin/whitelist-emails");
}
