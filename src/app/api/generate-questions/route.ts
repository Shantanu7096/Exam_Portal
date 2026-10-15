import { NextRequest, NextResponse } from "next/server";
import { generateQuestionsFromText } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      examId,
      textContent,
      examTitle,
      duration = 30,
      questionCount = 5,
      marksPerQuestion = 1,
    } = body;

    if (!textContent || textContent.trim().length < 20) {
      return NextResponse.json(
        { error: "Study material text content is required (minimum 20 characters)" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let targetExamId = examId;

    // If no examId provided, create a practice exam automatically
    if (!targetExamId) {
      const { data: newExam, error: examError } = await supabase
        .from("exams")
        .insert({
          title: examTitle || `AI Practice Test - ${new Date().toLocaleDateString()}`,
          description: "Dynamically generated practice test curated via Gemini AI",
          duration: Number(duration),
          total_questions: Number(questionCount),
          is_active: true,
          type: "practice",
        })
        .select()
        .single();

      if (examError) {
        console.error("Error creating exam for AI questions:", examError);
        return NextResponse.json({ error: examError.message }, { status: 500 });
      }

      targetExamId = newExam.id;
    }

    // Call Gemini API to extract MCQs and pseudocode questions
    const generated = await generateQuestionsFromText(textContent, Number(questionCount));

    if (!generated || generated.length === 0) {
      return NextResponse.json(
        { error: "No questions could be extracted from the provided text" },
        { status: 422 }
      );
    }

    // Prepare rows for bulk insert into Supabase 'questions' table
    const rowsToInsert = generated.map((q, idx) => ({
      exam_id: targetExamId,
      question_order: idx + 1,
      question_text: q.question_text,
      options_json: q.type === "mcq" ? q.options : null,
      correct_answer: q.correct_answer,
      type: q.type,
      marks: marksPerQuestion,
      negative_marks: q.type === "mcq" ? 0.25 : 0.0,
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting generated questions:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update the total questions counter on the exam
    await supabase
      .from("exams")
      .update({ total_questions: rowsToInsert.length })
      .eq("id", targetExamId);

    return NextResponse.json({
      success: true,
      examId: targetExamId,
      count: insertedQuestions?.length || 0,
      questions: insertedQuestions,
    });
  } catch (error: any) {
    console.error("API /api/generate-questions caught error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
