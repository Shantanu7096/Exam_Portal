import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    // Fetch auth users
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Fetch profiles with role: admin
    const { data: profileList, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "admin");

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const profileMap = new Map((profileList || []).map((p) => [p.id, p]));

    // Match auth users that have role === 'admin'
    const staffMembers = (authData.users || [])
      .filter((user) => {
        const role = user.user_metadata?.role || profileMap.get(user.id)?.role;
        return role === "admin";
      })
      .map((user) => {
        const prof = profileMap.get(user.id);
        return {
          id: user.id,
          email: user.email,
          fullName:
            user.user_metadata?.full_name ||
            prof?.full_name ||
            "Administrator",
          designation:
            user.user_metadata?.designation ||
            (user.email === "admin@exam.com"
              ? "Super Administrator"
              : "Exam Coordinator / Faculty"),
          role: "admin",
          isVerified: Boolean(user.email_confirmed_at),
          createdAt: user.created_at || prof?.created_at,
          lastSignInAt: user.last_sign_in_at || null,
        };
      });

    return NextResponse.json({ staff: staffMembers });
  } catch (err: any) {
    console.error("Fetch staff error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load staff list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      fullName,
      email,
      password,
      designation = "Faculty Examiner",
      role = "admin",
    } = await req.json();

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
          designation: designation.trim(),
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
      message: `Account for ${fullName} (${email}) created and verified successfully.`,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName.trim(),
        designation: designation.trim(),
      },
    });
  } catch (err: any) {
    console.error("Staff creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create administrator account" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("id");

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check user to avoid deleting primary superadmin
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(staffId);

    if (userData?.user?.email === "admin@exam.com") {
      return NextResponse.json(
        { error: "Cannot delete the default Super Administrator account." },
        { status: 403 }
      );
    }

    // Delete user from auth
    const { error: delAuthErr } =
      await supabaseAdmin.auth.admin.deleteUser(staffId);
    if (delAuthErr) {
      return NextResponse.json({ error: delAuthErr.message }, { status: 500 });
    }

    // Delete profile
    await supabaseAdmin.from("profiles").delete().eq("id", staffId);

    return NextResponse.json({
      success: true,
      message: "Faculty / Administrator account removed successfully.",
    });
  } catch (err: any) {
    console.error("Staff deletion error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
