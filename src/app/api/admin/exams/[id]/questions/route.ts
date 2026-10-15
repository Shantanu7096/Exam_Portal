import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const supabase = createAdminClient();

    const [examRes, questionsRes] = await Promise.all([
      supabase.from("exams").select("*").eq("id", examId).single(),
      supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("question_order", { ascending: true }),
    ]);

    if (examRes.error) {
      return NextResponse.json({ error: examRes.error.message }, { status: 404 });
    }

    return NextResponse.json({
      exam: examRes.data,
      questions: questionsRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const body = await req.json();
    const { questionText, type, options, correctAnswer, marks, negativeMarks } = body;

    if (!questionText || !correctAnswer) {
      return NextResponse.json(
        { error: "Question text and correct answer are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Determine next order
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("exam_id", examId);

    const nextOrder = (count || 0) + 1;

    const { data: newQuestion, error } = await supabase
      .from("questions")
      .insert({
        exam_id: examId,
        question_order: nextOrder,
        question_text: questionText,
        type: type || "mcq",
        options_json: type === "mcq" ? options : null,
        correct_answer: correctAnswer,
        marks: marks || 1,
        negative_marks: negativeMarks || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update total_questions on the exam
    await supabase
      .from("exams")
      .update({ total_questions: nextOrder })
      .eq("id", examId);

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId)
      .eq("exam_id", examId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Recalculate total_questions
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("exam_id", examId);

    await supabase
      .from("exams")
      .update({ total_questions: count || 0 })
      .eq("id", examId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
