import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role = "student" } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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
    const cleanRole = role.toLowerCase() === "admin" ? "admin" : "student";

    // 1. Create user in Supabase Auth with auto-confirmed email
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email so student/admin can log in immediately
        user_metadata: {
          full_name: fullName || (cleanRole === "admin" ? "Exam Administrator" : "Student Candidate"),
          role: cleanRole,
          allowed_attempts: 3,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Ensure profile is created/updated in public.profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName || (cleanRole === "admin" ? "Exam Administrator" : "Student Candidate"),
        role: cleanRole,
        allowed_attempts: 3,
      });

    if (profileError) {
      console.warn("Profile upsert note:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
        role: cleanRole,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register account" },
      { status: 500 }
    );
  }
}
