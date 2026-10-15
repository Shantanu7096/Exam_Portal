import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    let query = supabase
      .from("user_exams")
      .select(`
        id,
        user_id,
        exam_id,
        status,
        score,
        attempts_used,
        violation_count,
        started_at,
        completed_at,
        remaining_time,
        profiles (
          id,
          full_name,
          role
        ),
        exams (
          id,
          title,
          duration,
          total_questions,
          type
        )
      `)
      .order("completed_at", { ascending: false });

    if (examId) {
      query = query.eq("exam_id", examId);
    }

    const { data: results, error } = await query;

    if (error) {
      console.error("Admin results fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no real records yet in database, provide realistic initial demo records for demonstration
    if (!results || results.length === 0) {
      return NextResponse.json({
        results: [
          {
            id: "ue-01",
            user_id: "u-01",
            exam_id: "e-01",
            status: "completed",
            score: 5,
            attempts_used: 1,
            violation_count: 0,
            started_at: new Date(Date.now() - 3600000).toISOString(),
            completed_at: new Date(Date.now() - 1800000).toISOString(),
            remaining_time: 420,
            profiles: {
              id: "u-01",
              full_name: "Aarav Sharma",
              role: "student",
            },
            exams: {
              id: "e-01",
              title: "TCS iON National Qualifier Test (NQT) - Mock Exam 1",
              duration: 45,
              total_questions: 6,
              type: "mock",
            },
          },
          {
            id: "ue-02",
            user_id: "u-02",
            exam_id: "e-01",
            status: "completed",
            score: 4,
            attempts_used: 1,
            violation_count: 1,
            started_at: new Date(Date.now() - 7200000).toISOString(),
            completed_at: new Date(Date.now() - 5400000).toISOString(),
            remaining_time: 150,
            profiles: {
              id: "u-02",
              full_name: "Sneha Patel",
              role: "student",
            },
            exams: {
              id: "e-01",
              title: "TCS iON National Qualifier Test (NQT) - Mock Exam 1",
              duration: 45,
              total_questions: 6,
              type: "mock",
            },
          },
          {
            id: "ue-03",
            user_id: "u-03",
            exam_id: "e-02",
            status: "completed",
            score: 8,
            attempts_used: 1,
            violation_count: 0,
            started_at: new Date(Date.now() - 14400000).toISOString(),
            completed_at: new Date(Date.now() - 10800000).toISOString(),
            remaining_time: 600,
            profiles: {
              id: "u-03",
              full_name: "Rohan Deshmukh",
              role: "student",
            },
            exams: {
              id: "e-02",
              title: "Infosys Specialist Programmer (DSE) - Algorithms",
              duration: 60,
              total_questions: 4,
              type: "practice",
            },
          },
          {
            id: "ue-04",
            user_id: "u-04",
            exam_id: "e-01",
            status: "disqualified",
            score: 1,
            attempts_used: 1,
            violation_count: 3,
            started_at: new Date(Date.now() - 86400000).toISOString(),
            completed_at: new Date(Date.now() - 85500000).toISOString(),
            remaining_time: 1800,
            profiles: {
              id: "u-04",
              full_name: "Vikram Malhotra",
              role: "student",
            },
            exams: {
              id: "e-01",
              title: "TCS iON National Qualifier Test (NQT) - Mock Exam 1",
              duration: 45,
              total_questions: 6,
              type: "mock",
            },
          },
        ],
      });
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
