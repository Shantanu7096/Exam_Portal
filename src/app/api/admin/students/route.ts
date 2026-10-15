import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: students, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If empty, return mock students for demonstration
    if (!students || students.length === 0) {
      return NextResponse.json({
        students: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            full_name: "Aakash Verma",
            role: "student",
            allowed_attempts: 3,
          },
          {
            id: "22222222-2222-2222-2222-222222222222",
            full_name: "Pooja Hegde",
            role: "student",
            allowed_attempts: 2,
          },
          {
            id: "33333333-3333-3333-3333-333333333333",
            full_name: "Siddharth Rao",
            role: "student",
            allowed_attempts: 5,
          },
        ],
      });
    }

    return NextResponse.json({ students });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { studentId, allowedAttempts } = await req.json();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({ allowed_attempts: allowedAttempts })
      .eq("id", studentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, allowedAttempts = 3 } = await req.json();
    const supabase = createAdminClient();

    // Insert new profile directly
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(),
        full_name: fullName,
        role: "student",
        allowed_attempts: allowedAttempts,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
