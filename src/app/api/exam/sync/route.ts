import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { userExamId, remainingTime, violationCount, responses } = await req.json();

    if (!userExamId) {
      return NextResponse.json({ error: "userExamId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Update user_exam session
    await supabase
      .from("user_exams")
      .update({
        remaining_time: remainingTime,
        violation_count: violationCount ?? 0,
      })
      .eq("id", userExamId);

    // 2. Sync responses if provided
    if (responses && typeof responses === "object") {
      const rows = Object.values(responses).map((r: any) => ({
        user_exam_id: userExamId,
        question_id: r.question_id,
        selected_answer: r.selected_answer || null,
        status: r.status,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        // Upsert responses into Supabase
        await supabase
          .from("responses")
          .upsert(rows, { onConflict: "user_exam_id,question_id" });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Exam sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
