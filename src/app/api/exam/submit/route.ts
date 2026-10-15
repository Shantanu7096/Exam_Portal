import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { userExamId, examId, responses, reason } = await req.json();

    if (!userExamId || !examId) {
      return NextResponse.json(
        { error: "userExamId and examId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch official questions with correct answers to grade
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, type, correct_answer, marks, negative_marks")
      .eq("exam_id", examId);

    if (qError) {
      console.error("Error fetching questions to grade:", qError);
      return NextResponse.json({ error: qError.message }, { status: 500 });
    }

    let calculatedScore = 0;
    let totalMarks = 0;

    const responseList = responses ? Object.values(responses) : [];
    const responseMap = new Map<string, any>();
    responseList.forEach((r: any) => responseMap.set(r.question_id, r));

    // Grade MCQs
    questions?.forEach((q) => {
      totalMarks += Number(q.marks || 1);
      const studentResp = responseMap.get(q.id);
      const selected = studentResp?.selected_answer?.trim();

      if (selected) {
        if (selected.toLowerCase() === q.correct_answer.trim().toLowerCase()) {
          calculatedScore += Number(q.marks || 1);
        } else {
          calculatedScore -= Number(q.negative_marks || 0);
        }
      }
    });

    const isDisqualified =
      reason?.toLowerCase().includes("violation") ||
      reason?.toLowerCase().includes("disqualified");

    const finalStatus = isDisqualified ? "disqualified" : "completed";
    const finalScore = Math.max(0, calculatedScore);

    // Update user_exam session
    const { error: updateError } = await supabase
      .from("user_exams")
      .update({
        status: finalStatus,
        score: finalScore,
        completed_at: new Date().toISOString(),
        remaining_time: 0,
      })
      .eq("id", userExamId);

    if (updateError) {
      console.error("Error updating user_exams on submit:", updateError);
    }

    // Upsert final responses
    if (responseList.length > 0) {
      const rows = responseList.map((r: any) => ({
        user_exam_id: userExamId,
        question_id: r.question_id,
        selected_answer: r.selected_answer || null,
        status: r.status,
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from("responses")
        .upsert(rows, { onConflict: "user_exam_id,question_id" });
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      score: finalScore,
      totalMarks,
      percentage: totalMarks > 0 ? ((finalScore / totalMarks) * 100).toFixed(1) : "0.0",
      reason: reason || "Normal Submission",
    });
  } catch (err: any) {
    console.error("Exam submit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
