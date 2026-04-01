"use server";

import { getCachedClient, getCachedUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const PIPELINE_BASE = "https://api.almostcrackd.ai/pipeline";

async function getPipelineToken(): Promise<string> {
  const supabase = await getCachedClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return session.access_token;
}

/** Steps 1 & 2: obtain a presigned URL, upload the file, return the public CDN URL. */
async function uploadFile(file: File, token: string): Promise<string> {
  const contentType = file.type || "image/jpeg";

  const presignedRes = await fetch(
    `${PIPELINE_BASE}/generate-presigned-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType }),
    }
  );
  if (!presignedRes.ok) {
    const body = await presignedRes.text();
    throw new Error(
      `Presigned URL request failed: ${body || presignedRes.statusText}`
    );
  }
  const { presignedUrl, cdnUrl } = await presignedRes.json();

  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!uploadRes.ok) {
    throw new Error(`Image upload failed: ${uploadRes.statusText}`);
  }

  return cdnUrl;
}

/** Step 3: register a CDN URL with the pipeline; returns the new image row ID. */
async function registerImage(
  imageUrl: string,
  isCommonUse: boolean,
  token: string
): Promise<string> {
  const res = await fetch(`${PIPELINE_BASE}/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, isCommonUse }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Image registration failed: ${body || res.statusText}`
    );
  }
  const { imageId } = await res.json();
  return imageId;
}

/** Upload a file if provided, otherwise fall back to URL input or existing URL. */
async function resolveImageUrl(
  formData: FormData,
  existingUrl: string | null,
  token: string
): Promise<string | null> {
  const file = formData.get("file") as File | null;
  if (file?.size && file.size > 0) {
    return uploadFile(file, token);
  }
  const url = (formData.get("url") as string)?.trim() || null;
  return url || existingUrl;
}

function isNextRedirect(e: unknown): boolean {
  return typeof e === "object" && e !== null && "digest" in e;
}

export async function deleteImageAction(id: string): Promise<string | null> {
  const supabase = await getCachedClient();
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return error.message;
  revalidatePath("/admin/images");
  return null;
}

export async function createImageAction(
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const supabase = await getCachedClient();
    const token = await getPipelineToken();

    const user = await getCachedUser();
    if (!user) return { error: "Not authenticated" };

    const is_common_use = formData.get("is_common_use") === "on";
    const is_public = formData.get("is_public") === "on";
    const additional_context =
      (formData.get("additional_context") as string) || null;
    const image_description =
      (formData.get("image_description") as string) || null;
    const celebrity_recognition =
      (formData.get("celebrity_recognition") as string) || null;

    const imageUrl = await resolveImageUrl(formData, null, token);
    if (!imageUrl) return { error: "Please provide an image file or URL" };

    const imageId = await registerImage(imageUrl, is_common_use, token);

    const { error } = await supabase
      .from("images")
      .update({
        profile_id: user.id,
        is_public,
        additional_context,
        image_description,
        celebrity_recognition,
      })
      .eq("id", imageId);

    if (error) return { error: error.message };
    revalidatePath("/admin/images");
    redirect("/admin/images");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function updateImageAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    const supabase = await getCachedClient();
    const token = await getPipelineToken();
    const { data: existing } = await supabase
      .from("images")
      .select("url")
      .eq("id", id)
      .single();
    const url = await resolveImageUrl(formData, existing?.url ?? null, token);
    const profile_id = (formData.get("profile_id") as string) || null;
    const is_common_use = formData.get("is_common_use") === "on";
    const is_public = formData.get("is_public") === "on";
    const additional_context =
      (formData.get("additional_context") as string) || null;
    const image_description =
      (formData.get("image_description") as string) || null;
    const celebrity_recognition =
      (formData.get("celebrity_recognition") as string) || null;

    const { error } = await supabase
      .from("images")
      .update({
        url,
        profile_id: profile_id || null,
        is_common_use,
        is_public,
        additional_context,
        image_description,
        celebrity_recognition,
      })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin/images");
    revalidatePath(`/admin/images/${id}/edit`);
    redirect("/admin/images");
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
