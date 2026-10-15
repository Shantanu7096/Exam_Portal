import React from "react";
import Link from "next/link";
import {
  Clock,
  BookCheck,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Shield,
  BookOpen,
  Download,
  Calendar,
  FileText,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function parseExamMetadata(desc: string | null) {
  if (!desc) {
    return {
      summary: "Comprehensive test assessment matching TCS and Infosys standards.",
      isScheduled: false,
      startTime: null,
      endTime: null,
    };
  }
  try {
    if (desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      return {
        summary: parsed.summary || "Comprehensive test assessment matching TCS and Infosys standards.",
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

export default async function StudentDashboard() {
  const supabase = createAdminClient();

  let exams: any[] = [];
  let studyMaterials: any[] = [];

  try {
    const [examsRes, materialsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.storage.from("study-materials").list("", {
        limit: 20,
        sortBy: { column: "created_at", order: "desc" },
      }),
    ]);

    if (!examsRes.error && examsRes.data && examsRes.data.length > 0) {
      exams = examsRes.data;
    }

    if (!materialsRes.error && materialsRes.data) {
      studyMaterials = materialsRes.data.map((file) => {
        const { data } = supabase.storage
          .from("study-materials")
          .getPublicUrl(file.name);

        let category = "Reference Notes";
        const lower = file.name.toLowerCase();
        if (lower.includes("book") || lower.includes("textbook")) {
          category = "Reference Book";
        } else if (lower.includes("question") || lower.includes("bank") || lower.includes("pyq")) {
          category = "Question Bank";
        } else if (lower.includes("formula") || lower.includes("sheet")) {
          category = "Formula Sheet";
        }

        return {
          name: file.name,
          url: data.publicUrl,
          size: file.metadata?.size
            ? (file.metadata.size / (1024 * 1024)).toFixed(2) + " MB"
            : "File",
          category,
          createdAt: file.created_at,
        };
      });
    }
  } catch (e) {
    console.error("Dashboard fetch error:", e);
  }

  // Fallback sample starter tests
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

  const now = new Date();

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
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
            All mock and scheduled tests run in full-screen proctoring mode. Access official tests during scheduled time windows, or explore study books and lecture notes below.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[200px]">
          <span className="text-xs text-slate-300 uppercase font-semibold tracking-wider">
            Allowed Attempts Per Test
          </span>
          <div className="text-3xl font-black text-amber-400 mt-1">3 Attempts</div>
          <span className="text-[11px] text-slate-300 block mt-1">
            Answers revealed on completion
          </span>
        </div>
      </div>

      {/* Available Tests List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Assigned Assessments & Scheduled Tests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled mock tests unlock during designated admin windows. On-demand tests can be launched anytime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const meta = parseExamMetadata(exam.description);
            const isAI = exam.type === "practice";

            let canStart = true;
            let statusBadge = null;
            let buttonText = "Start Test";
            let buttonDisabled = false;

            if (meta.isScheduled && meta.startTime) {
              const start = new Date(meta.startTime);
              const end = meta.endTime ? new Date(meta.endTime) : null;

              if (now < start) {
                canStart = false;
                buttonDisabled = true;
                buttonText = `Starts ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    Scheduled: {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                );
              } else if (end && now > end) {
                canStart = false;
                buttonDisabled = true;
                buttonText = "Window Closed";
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                    Expired Window
                  </span>
                );
              } else {
                canStart = true;
                buttonDisabled = false;
                buttonText = "Enter Live Exam";
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse">
                    ● Live Window Open
                  </span>
                );
              }
            } else {
              statusBadge = (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  On-Demand Practice
                </span>
              );
            }

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
                          Mock Assessment
                        </>
                      )}
                    </span>

                    <span className="text-xs text-slate-500 flex items-center font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {exam.duration} Minutes
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {exam.title}
                  </h3>

                  <div className="mb-3">{statusBadge}</div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {meta.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">
                    Questions: <strong className="text-slate-800">{exam.total_questions || 5}</strong>
                  </div>

                  {buttonDisabled ? (
                    <button
                      disabled
                      className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      <span>{buttonText}</span>
                    </button>
                  ) : (
                    <Link
                      href={`/exam/${exam.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow transition"
                    >
                      <span>{buttonText}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reference Books & Study Materials Library Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Course Materials & Reference Books
              </h2>
              <p className="text-xs text-slate-500">
                Download study materials, lecture summaries, and formula sheets uploaded by your professors and exam controllers.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full self-start sm:self-auto">
            {studyMaterials.length} Documents Available
          </span>
        </div>

        {studyMaterials.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              No study materials published yet. Any notes or textbooks uploaded by the exam controller will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyMaterials.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {doc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {doc.size}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">
                    {doc.name}
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {doc.createdAt
                      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Shared"}
                  </span>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
