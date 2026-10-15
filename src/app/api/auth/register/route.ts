import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, prnNumber, mobileNumber } = await req.json();

    if (!email || !password || !fullName || !prnNumber || !mobileNumber) {
      return NextResponse.json(
        { error: "Full Name, PRN Number, Mobile Number, Email, and Password are all required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Create candidate user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true, // Candidate can log in immediately with their credentials
        user_metadata: {
          full_name: fullName.trim(),
          prn_number: prnNumber.trim().toUpperCase(),
          mobile_number: mobileNumber.trim(),
          role: "student",
          allowed_attempts: 3,
        },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert profile record in public.profiles table
    const profilePayload: Record<string, any> = {
      id: userId,
      full_name: fullName.trim(),
      role: "student",
      allowed_attempts: 3,
    };

    // Attempt upsert (including prn_number & mobile_number if columns exist)
    try {
      const { error: fullProfileErr } = await supabaseAdmin.from("profiles").upsert({
        ...profilePayload,
        prn_number: prnNumber.trim().toUpperCase(),
        mobile_number: mobileNumber.trim(),
      });

      if (fullProfileErr) {
        // Fallback without dynamic columns if migration hasn't been executed
        await supabaseAdmin.from("profiles").upsert(profilePayload);
      }
    } catch {
      await supabaseAdmin.from("profiles").upsert(profilePayload);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
        fullName: fullName.trim(),
        prnNumber: prnNumber.trim().toUpperCase(),
        role: "student",
      },
    });
  } catch (err: any) {
    console.error("Candidate registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register candidate account" },
      { status: 500 }
    );
  }
}
