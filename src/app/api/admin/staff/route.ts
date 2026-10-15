import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, role = "admin" } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full Name, Email, and Password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create verified admin/faculty account
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          role: "admin",
          allowed_attempts: 10,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Insert into profiles with role: admin
    await supabaseAdmin.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName.trim(),
      role: "admin",
      allowed_attempts: 10,
    });

    return NextResponse.json({
      success: true,
      message: `Administrator / Faculty account for ${email} created successfully.`,
      user: authData.user,
    });
  } catch (err: any) {
    console.error("Staff creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create administrator account" },
      { status: 500 }
    );
  }
}
