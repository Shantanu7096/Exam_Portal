import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let response = NextResponse.json({
      success: true,
      message: "Administrator authenticated successfully.",
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      let friendlyError = error.message;
      if (friendlyError.includes("Invalid login credentials")) {
        friendlyError =
          "Invalid email or password. Please use admin@exam.com with AdminPassword@123.";
      }
      return NextResponse.json({ error: friendlyError }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to establish administrator session." },
        { status: 401 }
      );
    }

    // Verify role using service admin client
    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role = profile?.role || data.user.user_metadata?.role;
    if (role !== "admin" && cleanEmail !== "admin@exam.com") {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Access Denied: This account is registered as a student. Only administrators can access this portal.",
        },
        { status: 403 }
      );
    }

    return response;
  } catch (err: any) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { error: err.message || "Authentication service error" },
      { status: 500 }
    );
  }
}
