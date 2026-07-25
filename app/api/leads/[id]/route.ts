import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { statusUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Belt-and-suspenders: middleware already blocks unauthenticated access to
  // /admin/*, but the API route checks the session itself since it could be
  // called directly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update lead:", error.message);
    return NextResponse.json(
      { error: "Could not update status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
