"use server";

import { getCachedClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteAllowedSignupDomainAction(
  id: number
): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .delete()
    .eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/allowed-signup-domains");
  return null;
}

export async function createAllowedSignupDomainAction(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const apex_domain = (formData.get("apex_domain") as string)?.trim();
  if (!apex_domain) return { error: "Domain is required" };

  const { error } = await supabase
    .from("allowed_signup_domains")
    .insert({ apex_domain });

  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  redirect("/admin/allowed-signup-domains");
}

export async function updateAllowedSignupDomainAction(
  id: number,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await getCachedClient();
  const apex_domain = (formData.get("apex_domain") as string)?.trim();
  if (!apex_domain) return { error: "Domain is required" };

  const { error } = await supabase
    .from("allowed_signup_domains")
    .update({ apex_domain })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/allowed-signup-domains");
  revalidatePath(`/admin/allowed-signup-domains/${id}/edit`);
  redirect("/admin/allowed-signup-domains");
}
