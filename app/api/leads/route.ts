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

  const { error } = await supabase
    .from("leads")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      budget_range: parsed.data.budgetRange,
      message: parsed.data.message,
    });

  if (error) {
  console.error("=== SUPABASE ERROR START ===");
  console.error(error);
  console.error(JSON.stringify(error, null, 2));
  console.error("=== SUPABASE ERROR END ===");

  return NextResponse.json(
    {
      error: "Could not save your submission. Please try again.",
      supabase: {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    },
    { status: 500 }
  );
}

  return NextResponse.json({ success: true }, { status: 201 });
}
