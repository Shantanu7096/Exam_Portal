import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/student/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let redirectResponse = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    // Exchange the authorization code for an authenticated session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Ensure user profile exists with student role
      try {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin.from("profiles").upsert(
          {
            id: data.user.id,
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              "Student Candidate",
            role: "student",
            allowed_attempts: 3,
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.error("Profile sync error on OAuth callback:", profileErr);
      }

      return redirectResponse;
    }

    console.error("OAuth exchange error:", error);
  }

  // Fallback if no code or error
  return NextResponse.redirect(new URL(`/login?error=oauth_exchange_failed`, origin));
}
