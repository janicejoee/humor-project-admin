import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const humorFlavorIdRaw = url.searchParams.get("humor_flavor_id");
  const humorFlavorId = humorFlavorIdRaw ? parseInt(humorFlavorIdRaw, 10) : NaN;

  if (!humorFlavorIdRaw || Number.isNaN(humorFlavorId)) {
    return NextResponse.json(
      { error: "humor_flavor_id is required" },
      { status: 400 }
    );
  }

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

  const { data: steps, error } = await supabase
    .from("humor_flavor_steps")
    .select(
      "id, humor_flavor_id, order_by, description, llm_temperature, llm_model_id, llm_input_type_id, llm_output_type_id, humor_flavor_step_type_id"
    )
    .eq("humor_flavor_id", humorFlavorId)
    .order("order_by", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ steps: steps ?? [] });
}

