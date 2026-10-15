import React from "react";
import Link from "next/link";
import { Clock, BookCheck, Sparkles, ChevronRight, AlertCircle, Shield } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const supabase = createAdminClient();

  let exams: any[] = [];
  try {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      exams = data;
    }
  } catch (e) {
    console.error("Dashboard fetch error:", e);
  }

  // If no exams in Supabase yet, provide sample starter tests
  if (exams.length === 0) {
    exams = [
      {
        id: "demo-tcs-nqt-mock",
        title: "TCS National Qualifier Test (NQT) - Full Mock 1",
        description: "Official pattern mock: Numerical Ability, Reasoning, Pseudocode, and Hands-on Coding.",
        duration: 45,
        total_questions: 15,
        type: "mock",
      },
      {
        id: "demo-infosys-dse-practice",
        title: "Infosys DSE Practice Assessment - Dynamic Programming",
        description: "AI-generated practice test focused on algorithm tracing and complexity analysis.",
        duration: 30,
        total_questions: 10,
        type: "practice",
      },
    ];
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1f2937] via-[#2c3e50] to-[#1a252f] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
            <Shield className="w-3.5 h-3.5 mr-1 text-blue-400" />
            Anti-Cheat Proctoring Enabled
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Candidate
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">
            All mock and practice tests run in full-screen mode with real-time browser event tracking.
            Ensure stable internet and do not exit fullscreen during the session.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[200px]">
          <span className="text-xs text-slate-300 uppercase font-semibold tracking-wider">
            Allowed Attempts Per Test
          </span>
          <div className="text-3xl font-black text-amber-400 mt-1">3 Attempts</div>
          <span className="text-[11px] text-slate-300 block mt-1">
            Best score is retained
          </span>
        </div>
      </div>

      {/* Available Tests List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Assigned Assessments
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an exam below to enter the live proctored interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const isAI = exam.type === "practice";
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        isAI
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {isAI ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Practice Test
                        </>
                      ) : (
                        <>
                          <BookCheck className="w-3 h-3 mr-1" />
                          Official Mock
                        </>
                      )}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {exam.duration} Minutes
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {exam.description || "Comprehensive test assessment matching TCS and Infosys standards."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">
                    Questions: <strong className="text-slate-800">{exam.total_questions || 5}</strong>
                  </div>

                  <Link
                    href={`/exam/${exam.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition"
                  >
                    <span>Start Test</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
