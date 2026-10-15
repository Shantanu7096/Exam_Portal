import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const examId = params.id;

  try {
    const supabase = createAdminClient();
    const serverSupabase = await createClient();

    // 1. Get authenticated user or fallback for demo
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    const userId = user?.id || "00000000-0000-0000-0000-000000000001";
    let candidateName = user?.user_metadata?.full_name || "Candidate Student";
    let candidateRollNumber = "TCS-" + userId.substring(0, 8).toUpperCase();

    // 2. Fetch Exam details
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      // Fallback fallback sample test for immediate playability if DB exam doesn't exist
      return NextResponse.json({
        id: examId,
        title: "TCS iON National Qualifier Mock Test",
        duration: 30,
        questions: [
          {
            id: "q-1",
            exam_id: examId,
            question_order: 1,
            question_text: "What will be the output of the following pseudocode?\n\nInteger a = 15, b = 25\nInteger c = (a ^ b) + (a & b)\nPrint c",
            options_json: ["25", "30", "35", "40"],
            correct_answer: "35",
            type: "mcq",
            marks: 1,
            negative_marks: 0.25,
          },
          {
            id: "q-2",
            exam_id: examId,
            question_order: 2,
            question_text: "Which of the following sorting algorithms provides a worst-case time complexity of O(N log N) using divide-and-conquer strategy without needing O(N) extra auxiliary space in array form?",
            options_json: ["QuickSort", "MergeSort", "HeapSort", "BubbleSort"],
            correct_answer: "HeapSort",
            type: "mcq",
            marks: 1,
            negative_marks: 0.25,
          },
          {
            id: "q-3",
            exam_id: examId,
            question_order: 3,
            question_text: "Predict the output of the code snippet below:\n\nint arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\nptr += 2;\nprintf(\"%d\", *(ptr + 1));",
            options_json: ["20", "30", "40", "50"],
            correct_answer: "40",
            type: "mcq",
            marks: 1,
            negative_marks: 0.25,
          },
          {
            id: "q-4",
            exam_id: examId,
            question_order: 4,
            question_text: "Write pseudocode or explain an algorithm to detect a cycle in a singly linked list with O(N) time and O(1) space.",
            options_json: null,
            correct_answer: "Floyd's Cycle-Finding Algorithm (slow and fast pointers)",
            type: "essay",
            marks: 5,
            negative_marks: 0.0,
          },
          {
            id: "q-5",
            exam_id: examId,
            question_order: 5,
            question_text: "Which normal form guarantees the elimination of all transitive functional dependencies?",
            options_json: ["1NF", "2NF", "3NF", "BCNF"],
            correct_answer: "3NF",
            type: "mcq",
            marks: 1,
            negative_marks: 0.25,
          },
        ],
        userExamId: "demo-session-" + Date.now(),
        remainingTime: 30 * 60,
        candidateName,
        candidateRollNumber,
        initialResponses: {},
      });
    }

    // 3. Fetch Questions for this exam
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_order", { ascending: true });

    if (qError || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions configured for this exam yet." },
        { status: 400 }
      );
    }

    // 4. Check for active or previous user_exams session
    const { data: existingSession } = await supabase
      .from("user_exams")
      .select("*")
      .eq("user_id", userId)
      .eq("exam_id", examId)
      .order("attempts_used", { ascending: false })
      .limit(1)
      .maybeSingle();

    let userExam = existingSession;
    const initialResponses: Record<string, any> = {};

    if (!userExam || userExam.status === "completed" || userExam.status === "disqualified") {
      // Check attempt limits
      const { data: profile } = await supabase
        .from("profiles")
        .select("allowed_attempts")
        .eq("id", userId)
        .maybeSingle();

      const allowedAttempts = profile?.allowed_attempts ?? 3;
      const nextAttempt = (userExam?.attempts_used || 0) + 1;

      if (nextAttempt > allowedAttempts) {
        return NextResponse.json(
          { error: `You have exhausted your allowed attempts (${allowedAttempts}) for this exam.` },
          { status: 403 }
        );
      }

      // Create new session
      const { data: newSession, error: createSessionError } = await supabase
        .from("user_exams")
        .insert({
          user_id: userId,
          exam_id: examId,
          status: "in_progress",
          remaining_time: (exam.duration || 30) * 60,
          attempts_used: nextAttempt,
          violation_count: 0,
        })
        .select()
        .single();

      if (createSessionError) {
        console.error("Session creation error:", createSessionError);
        return NextResponse.json({ error: createSessionError.message }, { status: 500 });
      }

      userExam = newSession;
    } else {
      // Existing in_progress session - load existing responses
      const { data: prevResponses } = await supabase
        .from("responses")
        .select("*")
        .eq("user_exam_id", userExam.id);

      prevResponses?.forEach((r) => {
        initialResponses[r.question_id] = {
          question_id: r.question_id,
          selected_answer: r.selected_answer || "",
          status: r.status,
        };
      });
    }

    return NextResponse.json({
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      questions,
      userExamId: userExam.id,
      remainingTime: userExam.remaining_time || exam.duration * 60,
      candidateName,
      candidateRollNumber,
      initialResponses,
    });
  } catch (err: any) {
    console.error("Error starting exam:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to initialize exam session" },
      { status: 500 }
    );
  }
}
