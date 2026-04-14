import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type DuplicateFlavorBody = {
  humor_flavor_id?: number;
  new_slug?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_superadmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as DuplicateFlavorBody;
  const flavorId = Number(body.humor_flavor_id);
  const newSlug = (body.new_slug ?? "").trim();

  if (!Number.isFinite(flavorId) || flavorId <= 0) {
    return NextResponse.json(
      { error: "humor_flavor_id is required" },
      { status: 400 }
    );
  }

  if (!newSlug) {
    return NextResponse.json(
      { error: "A new unique flavor name is required" },
      { status: 400 }
    );
  }

  const { data: existingFlavorWithSlug, error: slugCheckError } = await supabase
    .from("humor_flavors")
    .select("id")
    .eq("slug", newSlug)
    .maybeSingle();

  if (slugCheckError) {
    return NextResponse.json({ error: slugCheckError.message }, { status: 500 });
  }

  if (existingFlavorWithSlug) {
    return NextResponse.json(
      { error: "That flavor name already exists. Please choose another." },
      { status: 409 }
    );
  }

  const { data: sourceFlavor, error: sourceFlavorError } = await supabase
    .from("humor_flavors")
    .select("id, description")
    .eq("id", flavorId)
    .single();

  if (sourceFlavorError || !sourceFlavor) {
    return NextResponse.json(
      { error: sourceFlavorError?.message ?? "Flavor not found" },
      { status: 404 }
    );
  }

  const { data: sourceSteps, error: sourceStepsError } = await supabase
    .from("humor_flavor_steps")
    .select(
      "order_by, llm_temperature, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_system_prompt, llm_user_prompt, description"
    )
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true });

  if (sourceStepsError) {
    return NextResponse.json({ error: sourceStepsError.message }, { status: 500 });
  }

  const { data: insertedFlavor, error: insertFlavorError } = await supabase
    .from("humor_flavors")
    .insert({
      slug: newSlug,
      description: sourceFlavor.description,
    })
    .select("id")
    .single();

  if (insertFlavorError || !insertedFlavor) {
    return NextResponse.json(
      { error: insertFlavorError?.message ?? "Failed to create flavor" },
      { status: 500 }
    );
  }

  if ((sourceSteps ?? []).length > 0) {
    const newStepRows = (sourceSteps ?? []).map((step) => ({
      humor_flavor_id: insertedFlavor.id,
      order_by: step.order_by,
      llm_temperature: step.llm_temperature,
      llm_input_type_id: step.llm_input_type_id,
      llm_output_type_id: step.llm_output_type_id,
      llm_model_id: step.llm_model_id,
      humor_flavor_step_type_id: step.humor_flavor_step_type_id,
      llm_system_prompt: step.llm_system_prompt,
      llm_user_prompt: step.llm_user_prompt,
      description: step.description,
    }));

    const { error: insertStepsError } = await supabase
      .from("humor_flavor_steps")
      .insert(newStepRows);

    if (insertStepsError) {
      await supabase.from("humor_flavors").delete().eq("id", insertedFlavor.id);
      return NextResponse.json({ error: insertStepsError.message }, { status: 500 });
    }
  }

  revalidatePath("/admin/humor-flavors");
  return NextResponse.json({ ok: true, id: insertedFlavor.id });
}
