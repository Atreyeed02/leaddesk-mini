import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      budget_range: parsed.data.budgetRange,
      message: parsed.data.message,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to insert lead:", error.message);
    return NextResponse.json(
      { error: "Could not save your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
