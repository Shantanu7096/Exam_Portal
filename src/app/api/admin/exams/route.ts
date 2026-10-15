import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function parseExamMetadata(desc: string | null) {
  if (!desc) {
    return {
      summary: "",
      isScheduled: false,
      startTime: null,
      endTime: null,
    };
  }
  try {
    if (desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      return {
        summary: parsed.summary || "",
        isScheduled: Boolean(parsed.isScheduled),
        startTime: parsed.startTime || null,
        endTime: parsed.endTime || null,
      };
    }
  } catch {}
  return {
    summary: desc,
    isScheduled: false,
    startTime: null,
    endTime: null,
  };
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enhancedExams = (exams || []).map((exam) => {
      const meta = parseExamMetadata(exam.description);
      return {
        ...exam,
        summary: meta.summary,
        isScheduled: meta.isScheduled,
        startTime: meta.startTime,
        endTime: meta.endTime,
      };
    });

    return NextResponse.json({ exams: enhancedExams });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      duration,
      description,
      type = "mock",
      isScheduled = false,
      startTime = null,
      endTime = null,
    } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const encodedDescription = JSON.stringify({
      summary: description || "",
      isScheduled: Boolean(isScheduled),
      startTime: startTime || null,
      endTime: endTime || null,
    });

    const supabase = createAdminClient();
    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        title,
        duration: Number(duration) || 30,
        description: encodedDescription,
        type,
        is_active: true,
        total_questions: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const meta = parseExamMetadata(exam.description);
    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        summary: meta.summary,
        isScheduled: meta.isScheduled,
        startTime: meta.startTime,
        endTime: meta.endTime,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { examId, isActive, isScheduled, startTime, endTime, summary } =
      await req.json();
    const supabase = createAdminClient();

    // If updating schedule metadata
    if (isScheduled !== undefined || startTime !== undefined || endTime !== undefined || summary !== undefined) {
      const { data: currentExam } = await supabase
        .from("exams")
        .select("description")
        .eq("id", examId)
        .single();

      const currentMeta = parseExamMetadata(currentExam?.description || null);
      const updatedDescription = JSON.stringify({
        summary: summary !== undefined ? summary : currentMeta.summary,
        isScheduled: isScheduled !== undefined ? Boolean(isScheduled) : currentMeta.isScheduled,
        startTime: startTime !== undefined ? startTime : currentMeta.startTime,
        endTime: endTime !== undefined ? endTime : currentMeta.endTime,
      });

      const updatePayload: Record<string, any> = { description: updatedDescription };
      if (isActive !== undefined) updatePayload.is_active = isActive;

      const { error } = await supabase
        .from("exams")
        .update(updatePayload)
        .eq("id", examId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Simple status toggle
    const { error } = await supabase
      .from("exams")
      .update({ is_active: isActive })
      .eq("id", examId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
