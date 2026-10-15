import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  Sparkles,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Shield,
  Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

import SeedDatabaseButton from "@/components/admin/SeedDatabaseButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  let examCount = 0;
  let studentCount = 0;
  let sessionCount = 0;
  let recentExams: any[] = [];

  try {
    const [examsRes, studentsRes, sessionsRes] = await Promise.all([
      supabase.from("exams").select("*", { count: "exact" }),
      supabase.from("profiles").select("*", { count: "exact" }).eq("role", "student"),
      supabase.from("user_exams").select("*", { count: "exact" }),
    ]);

    examCount = examsRes.count || 0;
    recentExams = (examsRes.data || []).slice(0, 5);
    studentCount = studentsRes.count || 0;
    sessionCount = sessionsRes.count || 0;
  } catch (err) {
    console.error("Admin dashboard fetch error:", err);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Overview & Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage TCS iON / Infosys mock exams, review candidate proctoring logs, and generate AI test sets.
          </p>
        </div>
        <SeedDatabaseButton />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Exams
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {examCount}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Mock & AI Generated
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Students Enrolled
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {studentCount}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">
              Active Candidates
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <Link
          href="/admin/results"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-300 transition group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition">
              Exam Sessions
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {sessionCount}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">
              View All Results & Excel &rarr;
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition">
            <CheckCircle className="w-6 h-6" />
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Security Shield
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              Enforced
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Fullscreen & Anti-Tab
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-purple-200 mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Gemini AI Engine</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Generate Practice Test from Study Material</h3>
            <p className="text-xs text-purple-200 leading-relaxed mb-6">
              Paste a chapter from a textbook or notes. Gemini will extract technical MCQs,
              logic puzzles, and pseudocode tracing questions directly into the database.
            </p>
          </div>
          <Link
            href="/admin/exams/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-purple-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-50 transition w-fit"
          >
            <span>Launch AI Generator</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-4 border border-blue-200">
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Manual Authoring</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Create Mock Assessment Manually</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Configure exam parameters (duration, attempt limits, negative marking) and manually enter
              MCQs, code snippets, or essay evaluation questions.
            </p>
          </div>
          <Link
            href="/admin/exams"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition w-fit"
          >
            <span>View All Exams & Add Questions</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Recent Exams Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Assessments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Recently created or active test sets</p>
          </div>
          <Link
            href="/admin/exams"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All ({examCount})
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {recentExams.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No exams found in database yet. Use the buttons above to create one.
            </div>
          ) : (
            recentExams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">{exam.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        exam.type === "practice"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {exam.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-4">
                    <span>Duration: {exam.duration} mins</span>
                    <span>Total Questions: {exam.total_questions}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/exams/${exam.id}`}
                    className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded transition"
                  >
                    Manage Questions
                  </Link>
                  <Link
                    href={`/student/exam/${exam.id}`}
                    className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition"
                  >
                    Test Live
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
